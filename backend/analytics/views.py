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
