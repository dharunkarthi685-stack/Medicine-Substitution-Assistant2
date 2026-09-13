from rest_framework import generics, status, views
from pathlib import Path
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from django.db.models import Q
from .models import Order
from .serializers import OrderSerializer, CreateOrderInputSerializer
from medicines.models import Medicine
from users.permissions import IsAdminUserRole

class OrderListCreateView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_admin:
            qs = Order.objects.all().order_by('-created_at')
        else:
            qs = Order.objects.filter(user=user).order_by('-created_at')
        
        status_param = request.query_params.get('status', '').strip()
        search = request.query_params.get('search', '').strip()
        
        if status_param:
            qs = qs.filter(order_status__iexact=status_param)
        if search:
            qs = qs.filter(
                Q(order_number__icontains=search) |
                Q(shipping_name__icontains=search) |
                Q(shipping_phone__icontains=search) |
                Q(user__email__icontains=search)
            )

        serializer = OrderSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = CreateOrderInputSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)

class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def update(self, request, *args, **kwargs):
        # Only admin or specific status transitions
        instance = self.get_object()
        user = request.user
        
        if not user.is_admin:
            # Users can only cancel if status is PLACED
            new_status = request.data.get('order_status')
            if new_status == 'CANCELLED' and instance.order_status in ['PLACED', 'PENDING_PRESCRIPTION_VERIFICATION', 'APPROVED_PAYMENT_PENDING', 'CONFIRMED']:
                instance.order_status = 'CANCELLED'
                instance.save()
                return Response(OrderSerializer(instance).data)
            return Response({'error': 'You do not have permission to modify this order.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Prescription decisions are only accepted through the dedicated admin endpoint.
        if 'prescription_status' in request.data:
            return Response({'error': 'Use the prescription verification action.'}, status=status.HTTP_400_BAD_REQUEST)
        if request.data.get('order_status') in {'PENDING_PRESCRIPTION_VERIFICATION', 'APPROVED_PAYMENT_PENDING', 'PRESCRIPTION_REJECTED'}:
            return Response({'error': 'Prescription workflow statuses can only be set by the prescription verification process.'}, status=status.HTTP_400_BAD_REQUEST)
        if request.data.get('payment_status') == 'PAID':
            return Response({'error': 'Paid status is set only after verified payment confirmation.'}, status=status.HTTP_400_BAD_REQUEST)
        # Admin can update fulfillment status and payment status.
        if 'order_status' in request.data:
            instance.order_status = request.data['order_status']
        if 'payment_status' in request.data:
            instance.payment_status = request.data['payment_status']
        instance.save()
        return Response(OrderSerializer(instance).data)

class CartValidateView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        items = request.data.get('items', [])
        if not items:
            return Response({'error': 'No items to validate.'}, status=status.HTTP_400_BAD_REQUEST)

        validation_results = []
        has_errors = False

        for item in items:
            med_id = item.get('medicine_id')
            qty = item.get('quantity', 1)
            try:
                med = Medicine.objects.get(id=med_id)
                is_valid = True
                error_msg = None

                if not med.is_active:
                    is_valid = False
                    error_msg = f"'{med.name}' is currently unavailable."
                elif med.is_expired:
                    is_valid = False
                    error_msg = f"'{med.name}' expired on {med.expiry_date} and is unsafe to purchase."
                elif med.stock_quantity < qty:
                    is_valid = False
                    error_msg = f"Only {med.stock_quantity} units available for '{med.name}'."

                if not is_valid:
                    has_errors = True

                validation_results.append({
                    'medicine_id': med.id,
                    'name': med.name,
                    'price': str(med.price),
                    'stock_quantity': med.stock_quantity,
                    'is_valid': is_valid,
                    'error': error_msg
                })
            except Medicine.DoesNotExist:
                has_errors = True
                validation_results.append({
                    'medicine_id': med_id,
                    'is_valid': False,
                    'error': 'Medicine item no longer exists.'
                })

        return Response({
            'is_valid': not has_errors,
            'items': validation_results
        })


class PrescriptionUploadView(views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        prescription = request.FILES.get('prescription')
        if not prescription:
            return Response({'error': 'Please choose a prescription file to upload.'}, status=status.HTTP_400_BAD_REQUEST)
        if prescription.size > 10 * 1024 * 1024:
            return Response({'error': 'Prescription files must be 10 MB or smaller.'}, status=status.HTTP_400_BAD_REQUEST)
        if Path(prescription.name).suffix.lower() not in {'.pdf', '.jpg', '.jpeg', '.png'}:
            return Response({'error': 'Upload a PDF, JPG, JPEG or PNG prescription.'}, status=status.HTTP_400_BAD_REQUEST)

        if order.prescription_status != 'PENDING':
            return Response({'error': 'This order is not awaiting a prescription.'}, status=status.HTTP_400_BAD_REQUEST)
        order.prescription_file = prescription
        order.save(update_fields=['prescription_file', 'updated_at'])
        return Response(OrderSerializer(order).data)


class PrescriptionVerificationView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        decision = str(request.data.get('decision', '')).upper()
        if decision not in {'APPROVE', 'REJECT'}:
            return Response({'error': 'decision must be APPROVE or REJECT.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.prescription_status != 'PENDING':
            return Response({'error': 'This prescription has already been reviewed or is not required.'}, status=status.HTTP_400_BAD_REQUEST)
        if decision == 'APPROVE':
            order.prescription_status = 'APPROVED'
            order.order_status = 'APPROVED_PAYMENT_PENDING'
        else:
            order.prescription_status = 'REJECTED'
            order.order_status = 'PRESCRIPTION_REJECTED'
        order.save(update_fields=['prescription_status', 'order_status', 'updated_at'])
        return Response(OrderSerializer(order, context={'request': request}).data)

