from django.urls import path
from .views import (
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView,
    ConfirmCODPaymentView
)

urlpatterns = [
    path('razorpay/create/', CreateRazorpayOrderView.as_view(), name='razorpay_create'),
    path('razorpay/verify/', VerifyRazorpayPaymentView.as_view(), name='razorpay_verify'),
    path('cod/', ConfirmCODPaymentView.as_view(), name='cod_confirm'),
]
