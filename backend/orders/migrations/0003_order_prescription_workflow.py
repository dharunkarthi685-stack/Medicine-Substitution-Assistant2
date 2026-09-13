from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('orders', '0002_order_prescription_file')]

    operations = [
        migrations.AddField(
            model_name='order', name='prescription_status',
            field=models.CharField(choices=[('NOT_REQUIRED', 'Not Required'), ('PENDING', 'Pending Verification'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], db_index=True, default='NOT_REQUIRED', max_length=20),
        ),
        migrations.AlterField(
            model_name='order', name='order_status',
            field=models.CharField(choices=[('PENDING_PRESCRIPTION_VERIFICATION', 'Pending Prescription Verification'), ('APPROVED_PAYMENT_PENDING', 'Approved / Payment Pending'), ('PRESCRIPTION_REJECTED', 'Prescription Rejected'), ('PLACED', 'Order Placed'), ('CONFIRMED', 'Confirmed by Pharmacy'), ('SHIPPED', 'Out for Delivery / Ready for Pickup'), ('DELIVERED', 'Delivered / Completed'), ('CANCELLED', 'Cancelled')], db_index=True, default='PLACED', max_length=40),
        ),
    ]
