from django.http import JsonResponse
from django.contrib.admin.views.decorators import staff_member_required
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import File
from .serializers import FileSerializer
from .utils import get_file_stats, calculate_storage_savings

@staff_member_required
def combined_file_stats_view(request):
    """
    Returns a JSON object with both file statistics and storage savings.
    This endpoint is restricted to admin (staff) users.
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

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

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
