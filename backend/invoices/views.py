from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from orders.models import Order
from .generator import generate_invoice_pdf

class InvoiceDownloadPDFView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            if request.user.is_admin:
                order = Order.objects.get(id=order_id)
            else:
                order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        pdf_buffer = generate_invoice_pdf(order)
        filename = f"Invoice_{order.order_number}.pdf"

        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
