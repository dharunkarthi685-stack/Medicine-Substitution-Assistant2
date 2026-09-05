from rest_framework import serializers
from .models import Medicine

class MedicineSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    is_purchasable = serializers.BooleanField(read_only=True)

    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'generic_name', 'composition', 'strength',
            'dosage_form', 'manufacturer', 'price', 'stock_quantity',
            'expiry_date', 'prescription_required', 'disease_category',
            'description', 'image_url', 'is_active', 'search_count',
            'is_expired', 'is_in_stock', 'is_purchasable',
            'created_at', 'updated_at'
        ]

class MedicineSubstituteSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    is_purchasable = serializers.BooleanField(read_only=True)
    price_difference = serializers.SerializerMethodField()
    savings_percentage = serializers.SerializerMethodField()
    match_reason = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'generic_name', 'composition', 'strength',
            'dosage_form', 'manufacturer', 'price', 'stock_quantity',
            'expiry_date', 'prescription_required', 'disease_category',
            'description', 'image_url', 'is_active', 'is_expired',
            'is_in_stock', 'is_purchasable',
            'price_difference', 'savings_percentage', 'match_reason', 'match_score'
        ]

    def get_price_difference(self, obj):
        original_price = self.context.get('original_price', obj.price)
        diff = float(original_price) - float(obj.price)
        return round(diff, 2)

    def get_savings_percentage(self, obj):
        original_price = float(self.context.get('original_price', obj.price))
        if original_price <= 0:
            return 0.0
        diff = original_price - float(obj.price)
        if diff <= 0:
            return 0.0
        return round((diff / original_price) * 100, 1)

    def get_match_reason(self, obj):
        original_med = self.context.get('original_med')
        if not original_med:
            return "Identical therapeutic composition and strength."
        
        reasons = []
        if obj.composition.lower().strip() == original_med.composition.lower().strip():
            reasons.append("Exact Active Molecule / Composition")
        if obj.strength.lower().strip() == original_med.strength.lower().strip():
            reasons.append("Identical Dosage Strength")
        if obj.dosage_form.lower().strip() == original_med.dosage_form.lower().strip():
            reasons.append("Identical Bio-Delivery Form")
        
        if not reasons:
            reasons.append(f"Same Generic Class ({obj.generic_name})")
        
        return " • ".join(reasons)

    def get_match_score(self, obj):
        original_med = self.context.get('original_med')
        if not original_med:
            return 100
        score = 0
        if obj.composition.lower().strip() == original_med.composition.lower().strip():
            score += 50
        elif obj.generic_name.lower().strip() == original_med.generic_name.lower().strip():
            score += 35
        if obj.strength.lower().strip() == original_med.strength.lower().strip():
            score += 30
        if obj.dosage_form.lower().strip() == original_med.dosage_form.lower().strip():
            score += 20
        return min(score, 100)
