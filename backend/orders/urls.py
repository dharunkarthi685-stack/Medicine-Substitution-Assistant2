from django.urls import path
from .views import (
    OrderListCreateView,
    OrderDetailView,
    CartValidateView
)

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order_list_create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('cart/validate/', CartValidateView.as_view(), name='cart_validate'),
]
