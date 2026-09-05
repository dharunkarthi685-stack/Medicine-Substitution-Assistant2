from django.urls import path
from .views import (
    MedicineListCreateView,
    MedicineDetailView,
    MedicineSubstitutesView,
    MedicineCategoriesView,
    MedicineDosageFormsView,
    BulkCSVImportView
)

urlpatterns = [
    path('', MedicineListCreateView.as_view(), name='medicine_list_create'),
    path('<int:pk>/', MedicineDetailView.as_view(), name='medicine_detail'),
    path('<int:pk>/substitutes/', MedicineSubstitutesView.as_view(), name='medicine_substitutes'),
    path('categories/', MedicineCategoriesView.as_view(), name='medicine_categories'),
    path('dosage-forms/', MedicineDosageFormsView.as_view(), name='medicine_dosage_forms'),
    path('import-csv/', BulkCSVImportView.as_view(), name='medicine_import_csv'),
]
