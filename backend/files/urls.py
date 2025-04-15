from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import combined_file_stats_view, FileViewSet

router = DefaultRouter()
router.register(r'files', FileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api/storage-savings/', storage_savings_view, name='storage_savings'), # this can be removed if the file-stats api works
    path('api/file-stats/', combined_file_stats_view, name='file_stats'),

] 
