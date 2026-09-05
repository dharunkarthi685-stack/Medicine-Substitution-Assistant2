import json
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.db import transaction
from orders.models import Order
from orders.serializers import OrderSerializer
from .models import Transaction
from .services import create_razorpay_order, verify_razorpay_signature

class CreateRazorpayOrderView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'error': 'order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_status == 'PAID':
            return Response({'error': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Razorpay Order
        rzp_order = create_razorpay_order(
            amount_in_inr=order.total_amount,
            receipt_id=order.order_number,
            notes={
                'order_id': order.id,
                'email': request.user.email,
                'order_number': order.order_number
            }
        )

        # Update or create pending transaction
        Transaction.objects.update_or_create(
            order=order,
            defaults={
                'razorpay_order_id': rzp_order.get('id', ''),
                'amount': order.total_amount,
                'currency': 'INR',
                'status': 'PENDING'
            }
        )

        return Response({
            'razorpay_key': getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_1DP5mmOlF5G5ag'),
            'razorpay_order_id': rzp_order.get('id'),
            'amount': rzp_order.get('amount'), # In paise
            'amount_inr': str(order.total_amount),
            'currency': 'INR',
            'order_number': order.order_number,
            'user_name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email,
            'user_email': request.user.email,
            'user_phone': request.user.phone
        })

class VerifyRazorpayPaymentView(views.APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        order_id = request.data.get('order_id')
        razorpay_order_id = request.data.get('razorpay_order_id', '')
        razorpay_payment_id = request.data.get('razorpay_payment_id', '')
        razorpay_signature = request.data.get('razorpay_signature', '')

        if not order_id or not razorpay_payment_id:
            return Response({'error': 'Missing required payment verification details.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.select_for_update().get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_valid = verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature)

        if not is_valid:
            Transaction.objects.update_or_create(
                order=order,
                defaults={
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature,
                    'amount': order.total_amount,
                    'status': 'FAILED',
                    'raw_response': json.dumps(request.data)
                }
            )
            order.payment_status = 'FAILED'
            order.save()
            return Response({'error': 'Invalid payment signature. Verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Payment Successful
        Transaction.objects.update_or_create(
            order=order,
            defaults={
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
                'amount': order.total_amount,
                'currency': 'INR',
                'status': 'SUCCESS',
                'raw_response': json.dumps(request.data)
            }
        )

        order.payment_status = 'PAID'
        order.order_status = 'CONFIRMED'
        order.save()

        return Response({
            'message': 'Payment verified and captured successfully.',
            'order': OrderSerializer(order).data
        })

class ConfirmCODPaymentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'error': 'order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        order.payment_method = 'COD'
        order.payment_status = 'PENDING'
        order.order_status = 'CONFIRMED'
        order.save()

        Transaction.objects.update_or_create(
            order=order,
            defaults={
                'amount': order.total_amount,
                'currency': 'INR',
                'status': 'PENDING',
                'raw_response': 'Cash on Delivery selected'
            }
        )

        return Response({
            'message': 'Cash on Delivery order confirmed successfully.',
            'order': OrderSerializer(order).data
        })
