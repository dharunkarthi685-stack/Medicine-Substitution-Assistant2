from django.db import migrations


def backfill_unpaid_prescription_orders(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    pending = Order.objects.filter(
        items__medicine__prescription_required=True,
        payment_status__in=['PENDING', 'FAILED'],
    ).exclude(order_status__in=['CANCELLED', 'DELIVERED']).distinct()
    pending.update(
        prescription_status='PENDING',
        order_status='PENDING_PRESCRIPTION_VERIFICATION',
    )


class Migration(migrations.Migration):
    dependencies = [('orders', '0003_order_prescription_workflow')]
    operations = [migrations.RunPython(backfill_unpaid_prescription_orders, migrations.RunPython.noop)]
