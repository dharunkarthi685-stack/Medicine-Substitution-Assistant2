from django.db import models
from django.utils import timezone

class Medicine(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    generic_name = models.CharField(max_length=255, db_index=True)
    composition = models.CharField(max_length=255, db_index=True)
    strength = models.CharField(max_length=100)
    dosage_form = models.CharField(max_length=100) # Tablet, Capsule, Syrup, Injection, Cream, Drops, Inhaler
    manufacturer = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    expiry_date = models.DateField()
    prescription_required = models.BooleanField(default=False)
    disease_category = models.CharField(max_length=100, db_index=True)
    description = models.TextField(blank=True, default='')
    image_url = models.URLField(max_length=500, blank=True, default='')
    is_active = models.BooleanField(default=True)
    search_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['composition', 'strength', 'dosage_form']),
            models.Index(fields=['disease_category']),
        ]

    def __str__(self):
        return f"{self.name} ({self.strength} - {self.dosage_form}) - ₹{self.price}"

    @property
    def is_expired(self):
        return self.expiry_date < timezone.now().date()

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def is_purchasable(self):
        return self.is_active and not self.is_expired and self.stock_quantity > 0
