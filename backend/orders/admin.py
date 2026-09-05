from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('medicine_name', 'dosage_form', 'strength', 'quantity', 'unit_price', 'total_price')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'fulfillment_type', 'payment_method', 'payment_status', 'order_status', 'total_amount', 'created_at')
    list_filter = ('order_status', 'payment_status', 'payment_method', 'fulfillment_type', 'created_at')
    search_fields = ('order_number', 'shipping_name', 'shipping_phone', 'user__email')
    readonly_fields = ('order_number', 'subtotal', 'delivery_fee', 'tax_amount', 'total_amount', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
