from django.urls import path
from .views import (
    OrderListCreateView,
    OrderDetailView,
    CartValidateView,
    PrescriptionUploadView,
    PrescriptionVerificationView,
)

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order_list_create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('<int:pk>/prescription/', PrescriptionUploadView.as_view(), name='prescription_upload'),
    path('<int:pk>/prescription/verify/', PrescriptionVerificationView.as_view(), name='prescription_verify'),
    path('cart/validate/', CartValidateView.as_view(), name='cart_validate'),
]
