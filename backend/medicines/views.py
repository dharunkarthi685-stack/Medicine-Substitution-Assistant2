import csv
import io
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, Count, F
from django.utils import timezone
from .models import Medicine
from .serializers import MedicineSerializer, MedicineSubstituteSerializer
from users.permissions import IsAdminUserOrReadOnly, IsAdminUserRole

MEDICAL_DISCLAIMER = "Medicine substitutions should be confirmed by a qualified doctor or pharmacist before use. Never change prescribed dosage without clinical consultation."

class MedicineListCreateView(generics.ListCreateAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def get_queryset(self):
        qs = Medicine.objects.all()
        search = self.request.query_params.get('search', '').strip()
        category = self.request.query_params.get('category', '').strip()
        dosage_form = self.request.query_params.get('dosage_form', '').strip()
        in_stock_only = self.request.query_params.get('in_stock', '').lower() in ('true', '1')
        prescription = self.request.query_params.get('prescription', '').strip()
        ordering = self.request.query_params.get('ordering', 'name')
        active_only = self.request.query_params.get('active_only', 'true').lower() in ('true', '1')

        if active_only and not (self.request.user.is_authenticated and self.request.user.is_admin):
            qs = qs.filter(is_active=True)

        if search:
            # Increment search counter for first exact/close match to power analytics
            matched = qs.filter(
                Q(name__icontains=search) |
                Q(generic_name__icontains=search) |
                Q(composition__icontains=search) |
                Q(manufacturer__icontains=search)
            )
            if matched.exists():
                matched.filter(name__iexact=search).update(search_count=F('search_count') + 1)
            qs = matched

        if category:
            qs = qs.filter(disease_category__iexact=category)

        if dosage_form:
            qs = qs.filter(dosage_form__iexact=dosage_form)

        if in_stock_only:
            today = timezone.now().date()
            qs = qs.filter(stock_quantity__gt=0, expiry_date__gte=today)

        if prescription in ('true', 'false'):
            qs = qs.filter(prescription_required=(prescription == 'true'))

        valid_orderings = ['name', '-name', 'price', '-price', 'created_at', '-created_at', '-search_count']
        if ordering in valid_orderings:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('name')

        return qs

class MedicineDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment search/view count
        Medicine.objects.filter(pk=instance.pk).update(search_count=F('search_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class MedicineSubstitutesView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            target_med = Medicine.objects.get(pk=pk)
        except Medicine.DoesNotExist:
            return Response({'error': 'Medicine not found.'}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()

        # Primary substitute query: same composition, same strength, same dosage form
        primary_subs = Medicine.objects.filter(
            composition__iexact=target_med.composition,
            strength__iexact=target_med.strength,
            dosage_form__iexact=target_med.dosage_form,
            is_active=True,
            expiry_date__gte=today
        ).exclude(pk=target_med.pk)

        # Secondary substitute query: same generic name + strength + dosage form
        secondary_subs = Medicine.objects.filter(
            generic_name__iexact=target_med.generic_name,
            strength__iexact=target_med.strength,
            dosage_form__iexact=target_med.dosage_form,
            is_active=True,
            expiry_date__gte=today
        ).exclude(pk=target_med.pk).exclude(pk__in=primary_subs.values_list('pk', flat=True))

        all_substitutes = list(primary_subs) + list(secondary_subs)
        # Sort by price ascending (cheapest / highest savings first)
        all_substitutes.sort(key=lambda x: float(x.price))

        serializer = MedicineSubstituteSerializer(
            all_substitutes,
            many=True,
            context={'original_price': target_med.price, 'original_med': target_med}
        )

        cheaper_subs = [s for s in serializer.data if s['price_difference'] > 0]
        max_savings = max([s['savings_percentage'] for s in cheaper_subs], default=0)
        max_savings_amount = max([s['price_difference'] for s in cheaper_subs], default=0)

        return Response({
            'disclaimer': MEDICAL_DISCLAIMER,
            'target_medicine': MedicineSerializer(target_med).data,
            'substitutes_count': len(serializer.data),
            'cheaper_alternatives_count': len(cheaper_subs),
            'max_savings_percentage': max_savings,
            'max_savings_amount': max_savings_amount,
            'substitutes': serializer.data
        })

class MedicineCategoriesView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Medicine.objects.filter(is_active=True)\
            .values('disease_category')\
            .annotate(count=Count('id'))\
            .order_by('-count')
        return Response(categories)

class MedicineDosageFormsView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        forms = Medicine.objects.filter(is_active=True)\
            .values_list('dosage_form', flat=True)\
            .distinct()
        return Response(list(forms))

class BulkCSVImportView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        file_obj = request.FILES.get('file')
        raw_csv = request.data.get('csv_data', '')

        if not file_obj and not raw_csv:
            return Response({'error': 'Please provide a CSV file or csv_data string.'}, status=status.HTTP_400_BAD_REQUEST)

        if file_obj:
            try:
                decoded_file = file_obj.read().decode('utf-8')
                io_string = io.StringIO(decoded_file)
            except Exception as e:
                return Response({'error': f'Failed to decode CSV file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            io_string = io.StringIO(raw_csv)

        reader = csv.DictReader(io_string)
        created_count = 0
        updated_count = 0
        errors = []

        required_fields = ['name', 'generic_name', 'composition', 'strength', 'dosage_form', 'manufacturer', 'price', 'expiry_date']

        for row_idx, row in enumerate(reader, start=2):
            try:
                missing = [f for f in required_fields if not row.get(f, '').strip()]
                if missing:
                    errors.append(f"Row {row_idx}: Missing required fields: {', '.join(missing)}")
                    continue

                name = row['name'].strip()
                generic_name = row['generic_name'].strip()
                composition = row['composition'].strip()
                strength = row['strength'].strip()
                dosage_form = row['dosage_form'].strip()
                manufacturer = row['manufacturer'].strip()
                price = float(row['price'].strip())
                stock_quantity = int(row.get('stock_quantity', '0').strip() or '0')
                expiry_date = row['expiry_date'].strip()
                prescription_required = row.get('prescription_required', 'False').strip().lower() in ('true', '1', 'yes')
                disease_category = row.get('disease_category', 'General Health').strip() or 'General Health'
                description = row.get('description', '').strip()
                image_url = row.get('image_url', '').strip() or 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'

                med, created = Medicine.objects.update_or_create(
                    name=name,
                    strength=strength,
                    dosage_form=dosage_form,
                    defaults={
                        'generic_name': generic_name,
                        'composition': composition,
                        'manufacturer': manufacturer,
                        'price': price,
                        'stock_quantity': stock_quantity,
                        'expiry_date': expiry_date,
                        'prescription_required': prescription_required,
                        'disease_category': disease_category,
                        'description': description,
                        'image_url': image_url,
                        'is_active': True,
                    }
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

            except Exception as e:
                errors.append(f"Row {row_idx} ({row.get('name', 'Unknown')}): {str(e)}")

        return Response({
            'message': f"CSV Import complete. {created_count} created, {updated_count} updated.",
            'created_count': created_count,
            'updated_count': updated_count,
            'errors': errors,
            'total_processed': created_count + updated_count + len(errors)
        }, status=status.HTTP_200_OK if not errors or (created_count + updated_count > 0) else status.HTTP_400_BAD_REQUEST)
