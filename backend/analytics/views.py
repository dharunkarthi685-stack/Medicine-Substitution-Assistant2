from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta
from medicines.models import Medicine
from orders.models import Order, OrderItem
from users.models import User
from users.permissions import IsAdminUserRole

class PlatformAnalyticsView(views.APIView):
    """
    Public and user insights analytics
    """
    permission_classes = [AllowAny]

    def get(self, request):
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)
        sixty_days_future = today + timedelta(days=60)

        # 1. Summary KPIs
        total_medicines = Medicine.objects.filter(is_active=True).count()
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(payment_status='PAID').aggregate(sum_val=Sum('total_amount'))['sum_val'] or 0
        total_users = User.objects.count()

        # 2. Most Searched Medicines
        most_searched = Medicine.objects.filter(is_active=True)\
            .order_by('-search_count')[:6]\
            .values('id', 'name', 'generic_name', 'search_count', 'price', 'disease_category')

        # 3. Most Ordered Medicines
        most_ordered = OrderItem.objects.values('medicine_name')\
            .annotate(total_qty=Sum('quantity'), total_sales=Sum('total_price'))\
            .order_by('-total_qty')[:6]

        # 4. Category Distribution
        category_distribution = Medicine.objects.filter(is_active=True)\
            .values('disease_category')\
            .annotate(count=Count('id'))\
            .order_by('-count')[:8]

        # 5. Stock Health & Expiry
        in_stock_count = Medicine.objects.filter(is_active=True, stock_quantity__gt=10, expiry_date__gte=today).count()
        low_stock_count = Medicine.objects.filter(is_active=True, stock_quantity__lte=10, stock_quantity__gt=0).count()
        out_of_stock_count = Medicine.objects.filter(is_active=True, stock_quantity=0).count()
        expiring_soon_count = Medicine.objects.filter(is_active=True, expiry_date__lte=sixty_days_future, expiry_date__gte=today).count()

        # 6. Monthly Order Trend (Simulated or Real Daily distribution)
        recent_orders = Order.objects.all().order_by('-created_at')[:30]
        daily_trends = {}
        for i in range(7):
            day = today - timedelta(days=6 - i)
            day_str = day.strftime('%a, %d %b')
            daily_trends[day_str] = {'orders': 0, 'revenue': 0.0}

        for order in Order.objects.filter(created_at__date__gte=today - timedelta(days=7)):
            day_str = order.created_at.date().strftime('%a, %d %b')
            if day_str in daily_trends:
                daily_trends[day_str]['orders'] += 1
                if order.payment_status == 'PAID':
                    daily_trends[day_str]['revenue'] += float(order.total_amount)

        chart_trend = [
            {'date': k, 'orders': v['orders'], 'revenue': round(v['revenue'], 2)}
            for k, v in daily_trends.items()
        ]

        return Response({
            'kpis': {
                'total_medicines': total_medicines,
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'total_users': total_users,
                'estimated_savings_delivered': round(float(total_revenue) * 0.42, 2)
            },
            'most_searched': list(most_searched),
            'most_ordered': list(most_ordered),
            'category_distribution': list(category_distribution),
            'stock_health': {
                'in_stock': in_stock_count,
                'low_stock': low_stock_count,
                'out_of_stock': out_of_stock_count,
                'expiring_soon': expiring_soon_count
            },
            'order_trend': chart_trend
        })

class AdminAnalyticsDeepView(views.APIView):
    """
    Detailed analytics for Admin Dashboard
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        today = timezone.now().date()
        sixty_days_future = today + timedelta(days=60)

        # Low stock alert list
        low_stock_medicines = Medicine.objects.filter(stock_quantity__lte=20, is_active=True).values(
            'id', 'name', 'strength', 'dosage_form', 'stock_quantity', 'manufacturer'
        )[:10]

        # Expiring soon medicines
        expiring_medicines = Medicine.objects.filter(expiry_date__lte=sixty_days_future, is_active=True).values(
            'id', 'name', 'expiry_date', 'stock_quantity', 'manufacturer'
        )[:10]

        # Fulfillment breakdown
        fulfillment_stats = Order.objects.values('fulfillment_type').annotate(count=Count('id'))
        payment_stats = Order.objects.values('payment_method').annotate(count=Count('id'))

        return Response({
            'low_stock_medicines': list(low_stock_medicines),
            'expiring_medicines': list(expiring_medicines),
            'fulfillment_breakdown': list(fulfillment_stats),
            'payment_breakdown': list(payment_stats)
        })

class UserPersonalAnalyticsView(views.APIView):
    """
    Patient-specific personal order history & savings analytics
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        orders = Order.objects.filter(user=user).prefetch_related('items__medicine').order_by('-created_at')
        
        total_orders = orders.count()
        passed_orders = orders.filter(
            Q(order_status__in=['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'APPROVED_PAYMENT_PENDING']) |
            Q(payment_status='PAID')
        )
        delivered_orders = orders.filter(order_status='DELIVERED').count()
        
        total_spent = sum([float(o.total_amount) for o in orders if o.payment_status == 'PAID' or o.order_status in ['DELIVERED', 'CONFIRMED', 'SHIPPED', 'PLACED']])
        # Estimated patient savings (comparing generic substitute cost vs branded market MRP ~60% average savings)
        estimated_savings = round(total_spent * 1.48, 2) if total_spent > 0 else 0.0

        # Group medicines ordered by user
        medicine_stats = {}
        category_stats = {}
        monthly_stats = {}

        for order in orders:
            month_key = order.created_at.strftime('%b %Y')
            if month_key not in monthly_stats:
                monthly_stats[month_key] = {'month': month_key, 'spent': 0.0, 'savings': 0.0, 'orders': 0}
            
            spent_amt = float(order.total_amount)
            monthly_stats[month_key]['spent'] += spent_amt
            monthly_stats[month_key]['savings'] += round(spent_amt * 1.48, 2)
            monthly_stats[month_key]['orders'] += 1

            for item in order.items.all():
                med_name = item.medicine_name
                if med_name not in medicine_stats:
                    cat = item.medicine.disease_category if item.medicine else 'General'
                    medicine_stats[med_name] = {
                        'medicine_id': item.medicine.id if item.medicine else None,
                        'name': med_name,
                        'generic_name': item.medicine.generic_name if item.medicine else '',
                        'dosage_form': item.dosage_form or (item.medicine.dosage_form if item.medicine else 'Tablet'),
                        'strength': item.strength or (item.medicine.strength if item.medicine else ''),
                        'disease_category': cat,
                        'unit_price': float(item.unit_price),
                        'total_quantity': 0,
                        'total_spent': 0.0,
                        'total_saved': 0.0,
                        'order_count': 0,
                        'last_ordered_at': order.created_at.strftime('%d %b %Y'),
                        'last_order_number': order.order_number
                    }
                medicine_stats[med_name]['total_quantity'] += item.quantity
                item_spent = float(item.total_price)
                medicine_stats[med_name]['total_spent'] += item_spent
                medicine_stats[med_name]['total_saved'] += round(item_spent * 1.48, 2)
                medicine_stats[med_name]['order_count'] += 1

                cat_name = medicine_stats[med_name]['disease_category']
                category_stats[cat_name] = category_stats.get(cat_name, 0) + item.quantity

        ordered_medicines_list = sorted(medicine_stats.values(), key=lambda x: x['total_quantity'], reverse=True)
        category_dist_list = [{'category': k, 'count': v} for k, v in category_stats.items()]
        
        # Chronological monthly trends
        monthly_trend_list = list(reversed(list(monthly_stats.values())))

        return Response({
            'user_info': {
                'name': f"{user.first_name} {user.last_name}".strip() or user.email.split('@')[0],
                'email': user.email,
                'member_since': user.date_joined.strftime('%B %Y') if hasattr(user, 'date_joined') and user.date_joined else '2024'
            },
            'summary': {
                'total_orders': total_orders,
                'passed_orders': passed_orders.count(),
                'delivered_orders': delivered_orders,
                'total_spent': round(total_spent, 2),
                'total_saved': estimated_savings,
                'total_medicines_count': sum([m['total_quantity'] for m in ordered_medicines_list]),
                'avg_savings_rate': '59.6%' if total_spent > 0 else '0%'
            },
            'medicines_history': ordered_medicines_list,
            'category_distribution': category_dist_list,
            'monthly_trends': monthly_trend_list
        })

