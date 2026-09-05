from django.urls import path
from .views import InvoiceDownloadPDFView

urlpatterns = [
    path('<int:order_id>/pdf/', InvoiceDownloadPDFView.as_view(), name='invoice_download_pdf'),
]
