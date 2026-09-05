from django.urls import path
from .views import PlatformAnalyticsView, AdminAnalyticsDeepView

urlpatterns = [
    path('', PlatformAnalyticsView.as_view(), name='platform_analytics'),
    path('admin-deep/', AdminAnalyticsDeepView.as_view(), name='admin_analytics_deep'),
]
