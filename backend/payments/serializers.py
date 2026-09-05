from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'order', 'razorpay_order_id', 'razorpay_payment_id', 'amount', 'currency', 'status', 'created_at']
        read_only_fields = fields
