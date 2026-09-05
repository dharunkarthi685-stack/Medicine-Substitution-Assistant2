import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from django.utils import timezone

def generate_invoice_pdf(order):
    """
    Generates a professional healthcare tax invoice PDF using ReportLab
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#065f46'),
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#4b5563')
    )
    invoice_badge_style = ParagraphStyle(
        'InvoiceBadge',
        parent=styles['Normal'],
        fontSize=12,
        leading=15,
        alignment=2, # Right
        textColor=colors.HexColor('#047857'),
        fontName='Helvetica-Bold'
    )
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#374151')
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        alignment=1, # Center
        textColor=colors.HexColor('#dc2626'),
        fontName='Helvetica-Oblique'
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>MEDICINE SUBSTITUTION ASSISTANT</b><br/><font size=8 color='#059669'>Clinical Intelligence & Direct Generic Savings</font>", header_title_style),
            Paragraph(f"<b>TAX INVOICE</b><br/>Invoice #: INV-{order.order_number}<br/>Date: {order.created_at.strftime('%d-%b-%Y %H:%M')}", invoice_badge_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[3.5 * inch, 3.5 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10b981'), spaceAfter=10))

    # 2. Billing & Shipping info
    cust_info = f"""
    <b>BILL TO & SHIP TO:</b><br/>
    <b>Recipient:</b> {order.shipping_name}<br/>
    <b>Phone:</b> {order.shipping_phone}<br/>
    <b>Email:</b> {order.user.email}<br/>
    <b>Address:</b> {order.shipping_address}<br/>
    <b>City/State/PIN:</b> {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
    """

    order_info = f"""
    <b>ORDER INFORMATION:</b><br/>
    <b>Order Ref:</b> #{order.order_number}<br/>
    <b>Fulfillment:</b> {order.get_fulfillment_type_display()}<br/>
    <b>Payment Method:</b> {order.get_payment_method_display()}<br/>
    <b>Payment Status:</b> <font color='{'#059669' if order.payment_status == 'PAID' else '#d97706'}'><b>{order.payment_status}</b></font><br/>
    <b>Order Status:</b> <b>{order.get_order_status_display()}</b>
    """

    info_data = [[Paragraph(cust_info, meta_style), Paragraph(order_info, meta_style)]]
    info_table = Table(info_data, colWidths=[3.5 * inch, 3.5 * inch])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 15))

    # 3. Items Table
    item_header = [
        Paragraph("<b>#</b>", styles['Normal']),
        Paragraph("<b>Medicine Description</b>", styles['Normal']),
        Paragraph("<b>Dosage / Strength</b>", styles['Normal']),
        Paragraph("<b>Unit Price (₹)</b>", styles['Normal']),
        Paragraph("<b>Qty</b>", styles['Normal']),
        Paragraph("<b>Total (₹)</b>", styles['Normal'])
    ]
    items_rows = [item_header]

    for idx, item in enumerate(order.items.all(), start=1):
        items_rows.append([
            str(idx),
            Paragraph(f"<b>{item.medicine_name}</b>", meta_style),
            f"{item.dosage_form} ({item.strength})",
            f"Rs. {item.unit_price}",
            str(item.quantity),
            f"Rs. {item.total_price}"
        ])

    items_table = Table(items_rows, colWidths=[0.4 * inch, 2.5 * inch, 1.8 * inch, 0.9 * inch, 0.5 * inch, 0.9 * inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ecfdf5')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#065f46')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (3,0), (-1,-1), 'RIGHT'),
        ('ALIGN', (4,0), (4,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(items_table)
    story.append(Spacer(1, 10))

    # 4. Summary & Totals
    summary_data = [
        ["Subtotal:", f"Rs. {order.subtotal}"],
        ["Delivery Charges:", f"Rs. {order.delivery_fee}"],
        ["Estimated GST (5%):", f"Rs. {order.tax_amount}"],
        ["Total Payable Amount:", f"Rs. {order.total_amount}"]
    ]
    summary_table = Table(summary_data, colWidths=[2.0 * inch, 1.2 * inch])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica'),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('TEXTCOLOR', (0,-1), (-1,-1), colors.HexColor('#047857')),
        ('LINEABOVE', (0,-1), (-1,-1), 1, colors.HexColor('#10b981')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 3),
    ]))

    summary_wrapper = Table([[Paragraph("", styles['Normal']), summary_table]], colWidths=[3.8 * inch, 3.2 * inch])
    story.append(summary_wrapper)
    story.append(Spacer(1, 20))

    # 5. Medical Safety Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#e2e8f0'), spaceAfter=8))
    disclaimer_text = (
        "<b>CLINICAL NOTICE & DISCLAIMER:</b> Medicine substitutions should be confirmed by a qualified doctor or "
        "pharmacist before use. Prescriptions must be verified prior to clinical administration. Store medicines in a cool, "
        "dry place away from direct sunlight."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Thank you for using Medicine Substitution Assistant. For support, reach out to support@medassist.com", subtitle_style))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
