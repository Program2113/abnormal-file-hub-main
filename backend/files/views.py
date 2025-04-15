from django.http import JsonResponse
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import datetime, timedelta
from .models import File
from .serializers import FileSerializer
from .utils import get_file_stats, calculate_storage_savings

def combined_file_stats_view(request):
    """
    Returns a JSON object with both file statistics and storage savings.
    """
    # Retrieve file statistics (e.g., total file count and total size in MB)
    total_files, total_size_mb = get_file_stats()
    
    # Retrieve the storage savings in bytes due to deduplication.
    savings_bytes = calculate_storage_savings()
    
    # Return as JSON.
    return JsonResponse({
        "total_files": total_files,
        "total_size": total_size_mb,
        "savings_bytes": savings_bytes,
    })

class FileFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        # Get filter parameters
        filename = request.query_params.get('filename', '')
        file_type = request.query_params.get('file_type', '')
        min_size = request.query_params.get('min_size')
        max_size = request.query_params.get('max_size')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Apply filename search
        if filename:
            queryset = queryset.filter(original_filename__icontains=filename)

        # Apply file type filter
        if file_type:
            queryset = queryset.filter(file_type__icontains=file_type)

        # Apply size range filter
        if min_size:
            queryset = queryset.filter(size__gte=min_size)
        if max_size:
            queryset = queryset.filter(size__lte=max_size)

        # Apply date range filter
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
                queryset = queryset.filter(uploaded_at__gte=start_date)
            except ValueError:
                pass
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
                end_date = end_date + timedelta(days=1)  # Include the entire end date
                queryset = queryset.filter(uploaded_at__lt=end_date)
            except ValueError:
                pass

        return queryset

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [FileFilter, DjangoFilterBackend]
    filterset_fields = ['file_type']

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = {
            'file': file_obj,
            'original_filename': file_obj.name,
            'file_type': file_obj.content_type,
            'size': file_obj.size
        }
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
