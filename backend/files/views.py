from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import File
from .serializers import FileSerializer
from .utils import get_file_stats

from django.http import JsonResponse
from .utils import calculate_storage_savings
from django.contrib.admin.views.decorators import staff_member_required


@staff_member_required
def storage_savings_view(request):
    savings_bytes = calculate_storage_savings()
    return JsonResponse({
        'savings_bytes': savings_bytes
    })

@staff_member_required
def file_stats_view(request):
    total_files, total_size_mb = get_file_stats()
    return JsonResponse({
        'total_files': total_files,
        'total_size': total_size_mb
    })

# Create your views here.

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
