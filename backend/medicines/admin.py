from django.contrib import admin
from .models import Medicine

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('name', 'generic_name', 'composition', 'strength', 'dosage_form', 'price', 'stock_quantity', 'expiry_date', 'disease_category', 'is_active')
    list_filter = ('disease_category', 'dosage_form', 'prescription_required', 'is_active', 'expiry_date')
    search_fields = ('name', 'generic_name', 'composition', 'manufacturer')
    ordering = ('name',)
    readonly_fields = ('search_count', 'created_at', 'updated_at')
