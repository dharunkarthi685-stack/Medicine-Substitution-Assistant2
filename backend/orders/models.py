import uuid
from django.db import models
from django.conf import settings
from medicines.models import Medicine

class Order(models.Model):
    FULFILLMENT_CHOICES = (
        ('HOME_DELIVERY', 'Home Delivery'),
        ('PHARMACY_PICKUP', 'In-Store Pharmacy Pickup'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('RAZORPAY', 'Online Payment (Razorpay / UPI / Cards / NetBanking)'),
        ('COD', 'Cash on Delivery / Pay on Pickup'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    )
    ORDER_STATUS_CHOICES = (
        ('PLACED', 'Order Placed'),
        ('CONFIRMED', 'Confirmed by Pharmacy'),
        ('SHIPPED', 'Out for Delivery / Ready for Pickup'),
        ('DELIVERED', 'Delivered / Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    fulfillment_type = models.CharField(max_length=30, choices=FULFILLMENT_CHOICES, default='HOME_DELIVERY')
    
    # Shipping / Contact Details
    shipping_name = models.CharField(max_length=150)
    shipping_phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_pincode = models.CharField(max_length=10)

    # Payment & Financials
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default='RAZORPAY')
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    order_status = models.CharField(max_length=30, choices=ORDER_STATUS_CHOICES, default='PLACED')

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} - {self.user.email} (₹{self.total_amount})"

    @classmethod
    def generate_order_number(cls):
        return f"ORD-{uuid.uuid4().hex[:8].upper()}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, related_name='order_items')
    medicine_name = models.CharField(max_length=255)
    dosage_form = models.CharField(max_length=100)
    strength = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.medicine_name} ({self.strength}) in {self.order.order_number}"
