from django.db import migrations, models
import django.core.validators
import orders.models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='prescription_file',
            field=models.FileField(
                blank=True,
                null=True,
                upload_to=orders.models.prescription_upload_path,
                validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])],
            ),
        ),
    ]
