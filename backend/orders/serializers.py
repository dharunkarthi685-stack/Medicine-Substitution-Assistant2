from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from .models import Order, OrderItem
from medicines.models import Medicine
from users.serializers import UserProfileSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'medicine', 'medicine_name', 'dosage_form', 'strength', 'quantity', 'unit_price', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_info = UserProfileSerializer(source='user', read_only=True)
    has_transaction = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_info', 'fulfillment_type',
            'shipping_name', 'shipping_phone', 'shipping_address',
            'shipping_city', 'shipping_state', 'shipping_pincode',
            'payment_method', 'payment_status', 'order_status',
            'subtotal', 'delivery_fee', 'tax_amount', 'total_amount',
            'items', 'has_transaction', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'user', 'subtotal', 'delivery_fee', 'tax_amount', 'total_amount', 'created_at', 'updated_at']

    def get_has_transaction(self, obj):
        return hasattr(obj, 'transaction')

class CartItemInputSerializer(serializers.Serializer):
    medicine_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class CreateOrderInputSerializer(serializers.Serializer):
    fulfillment_type = serializers.ChoiceField(choices=['HOME_DELIVERY', 'PHARMACY_PICKUP'], default='HOME_DELIVERY')
    shipping_name = serializers.CharField(max_length=150)
    shipping_phone = serializers.CharField(max_length=20)
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_pincode = serializers.CharField(max_length=10)
    payment_method = serializers.ChoiceField(choices=['RAZORPAY', 'COD'], default='RAZORPAY')
    items = CartItemInputSerializer(many=True, min_length=1)

    def validate_items(self, items):
        medicine_ids = [item['medicine_id'] for item in items]
        medicines = Medicine.objects.filter(id__in=medicine_ids)
        med_map = {m.id: m for m in medicines}

        for item in items:
            med_id = item['medicine_id']
            qty = item['quantity']
            if med_id not in med_map:
                raise serializers.ValidationError(f"Medicine with ID {med_id} does not exist.")
            med = med_map[med_id]
            if not med.is_active:
                raise serializers.ValidationError(f"Medicine '{med.name}' is currently unavailable.")
            if med.is_expired:
                raise serializers.ValidationError(f"Medicine '{med.name}' has expired ({med.expiry_date}) and cannot be purchased.")
            if med.stock_quantity < qty:
                raise serializers.ValidationError(f"Insufficient stock for '{med.name}'. Available: {med.stock_quantity}, Requested: {qty}.")

        return items

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        items_data = validated_data.pop('items')
        
        # Calculate pricing
        subtotal = Decimal('0.00')
        order_items_to_create = []

        for item in items_data:
            med = Medicine.objects.select_for_update().get(id=item['medicine_id'])
            qty = item['quantity']
            unit_price = med.price
            item_total = unit_price * qty
            subtotal += item_total

            # Deduct stock
            med.stock_quantity -= qty
            med.save()

            order_items_to_create.append({
                'medicine': med,
                'medicine_name': med.name,
                'dosage_form': med.dosage_form,
                'strength': med.strength,
                'quantity': qty,
                'unit_price': unit_price,
                'total_price': item_total
            })

        fulfillment = validated_data.get('fulfillment_type', 'HOME_DELIVERY')
        delivery_fee = Decimal('30.00') if fulfillment == 'HOME_DELIVERY' else Decimal('0.00')
        tax_amount = round(subtotal * Decimal('0.05'), 2) # 5% GST
        total_amount = subtotal + delivery_fee + tax_amount

        order = Order.objects.create(
            order_number=Order.generate_order_number(),
            user=user,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            tax_amount=tax_amount,
            total_amount=total_amount,
            **validated_data
        )

        for item_dict in order_items_to_create:
            OrderItem.objects.create(order=order, **item_dict)

        return order
