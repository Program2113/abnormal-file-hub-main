from django.http import JsonResponse
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count
from datetime import datetime, timedelta
from .models import File, get_file_type
from .utils import calculate_storage_savings, get_file_stats, extract_text_from_file, compute_file_hash
from .serializers import FileSerializer
from django.shortcuts import render
from rest_framework.decorators import action
import logging
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json
import traceback
from rest_framework.decorators import api_view
from django.conf import settings
from django.http import FileResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import hashlib

# Configure logger
logger = logging.getLogger('files')
logger.setLevel(logging.DEBUG)

@api_view(['GET'])
def combined_file_stats_view(request):
    try:
        print("File stats endpoint accessed...")
        logger.info("File stats endpoint accessed", extra={
            'request_method': request.method,
            'request_path': request.path,
            'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown')
        })
        
        # Get file statistics using utility function
        total_files, total_size_bytes = get_file_stats()
        logger.debug("File statistics retrieved", extra={
            'total_files': total_files,
            'total_size_bytes': total_size_bytes
        })
        
        # Calculate storage savings using utility function
        savings_bytes = calculate_storage_savings()
        logger.debug("Storage savings calculated", extra={
            'savings_bytes': savings_bytes
        })
        
        # Prepare response data
        response_data = {
            'total_files': total_files,
            'total_size': total_size_bytes,  # in bytes
            'savings_bytes': savings_bytes  # in bytes
        }
        
        logger.info("File stats request completed successfully", extra={
            'response_data': response_data
        })
        
        print(f"Response for file stats view: {response_data}")
        return JsonResponse(response_data)
        
    except Exception as e:
        error_msg = f"Error in combined_file_stats_view: {str(e)}"
        logger.error(error_msg, exc_info=True, extra={
            'error_type': type(e).__name__,
            'error_message': str(e),
            'traceback': traceback.format_exc()
        })
        return JsonResponse({
            'error': 'An error occurred while processing the request',
            'details': str(e)
        }, status=500)

class FileFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        print("File filter view is invoked...")
        print(request.query_params)
        print(f"Initial queryset: {queryset}")
        # Get filter parameters
        filename = request.query_params.get('filename', '')
        file_type = request.query_params.get('file_type', '')
        min_size = request.query_params.get('min_size')
        max_size = request.query_params.get('max_size')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        selected_files = request.query_params.getlist('selected_files')
        content_query = request.query_params.get('content_query', '')

        print(f"Received filters - file_type: {file_type}, filename: {filename}, min_size: {min_size}, max_size: {max_size}, content_filter: {content_query}")

        # Apply filename search
        if filename:
            queryset = queryset.filter(original_filename__icontains=filename)
            print(f"After filename filter: {queryset.count()} files")

        # Apply file type filter
        if file_type and file_type != 'all':
            queryset = queryset.filter(file_type=file_type)
            print(f"After file_type filter: {queryset.count()} files")

        # Apply size range filter
        if min_size:
            try:
                min_size_bytes = int(min_size)
                queryset = queryset.filter(size__gte=min_size_bytes)
                print(f"After min_size filter: {queryset.count()} files")
            except ValueError:
                pass
        if max_size:
            try:
                max_size_bytes = int(max_size)
                queryset = queryset.filter(size__lte=max_size_bytes)
                print(f"After max_size filter: {queryset.count()} files")
            except ValueError:
                pass

        # Apply date range filter
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
                queryset = queryset.filter(uploaded_at__gte=start_date)
                print(f"After start_date filter: {queryset.count()} files")
            except ValueError:
                pass
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
                end_date = end_date + timedelta(days=1)  # Include the entire end date
                queryset = queryset.filter(uploaded_at__lt=end_date)
                print(f"After end_date filter: {queryset.count()} files")
            except ValueError:
                pass

        # Apply selected files filter
        if selected_files:
            queryset = queryset.filter(id__in=selected_files)
            print(f"After selected_files filter: {queryset.count()} files")

        if content_query:
            queryset = queryset.filter(content_text__icontains=content_query)
            print(f"After content_query filter: {queryset.count()} files")
            
        print(f"Final filtered count: {queryset.count()} files")
        return queryset

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [FileFilter, DjangoFilterBackend]
    filterset_fields = ['file_type']

    def list(self, request, *args, **kwargs):
        logger.info(
            'API: List files request received | query_params: %s | user: %s',
            dict(request.query_params),
            request.user.username if request.user.is_authenticated else 'anonymous'
        )

        try:
            response = super().list(request, *args, **kwargs)
            logger.info(
            'API: List files response | status_code: %s | count: %s',
            response.status_code,
            len(response.data)
            )

            return response
        except Exception as e:
            logger.error('API: List files error', {
                'error': str(e),
                'traceback': traceback.format_exc()
            })
            raise

    def create(self, request, *args, **kwargs):
        logger.info('API: Create file request received', {
            'filename': request.FILES.get('file').name if request.FILES.get('file') else None,
            'user': request.user.username if request.user.is_authenticated else 'anonymous'
        })
        try:
            file_obj = request.FILES.get('file')
            if not file_obj:
                return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            # 👇 --- Start of new logic ---
            # Extract text from the file before creating the serializer
            extracted_text = extract_text_from_file(file_obj)
            # --- End of new logic ---

            data = {
                'file': file_obj,
                'original_filename': file_obj.name,
                'file_type': get_file_type(file_obj.name),
                'size': file_obj.size,
                # 👇 Pass the extracted text to the serializer data
                'content_text': extracted_text
            }
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            response = Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            logger.info('API: Create file success', {
                'status_code': response.status_code,
                'file_id': response.data.get('id')
            })
            return response
        except Exception as e:
            logger.error('API: Create file error', {
                'error': str(e),
                'traceback': traceback.format_exc()
            })
            raise


    def perform_create(self, serializer: FileSerializer):
        uploaded_file = self.request.FILES.get("file")
        print(f"type: {type(uploaded_file)}")
        original_filename = uploaded_file.name
        file_type = get_file_type(original_filename)

        # Compute file hash
        uploaded_file.seek(0)
        file_hash = compute_file_hash(uploaded_file)
        uploaded_file.seek(0)

        # Check for duplicate
        duplicate = File.objects.filter(file_hash=file_hash).first()
        print("is duplicate:", duplicate)

        if duplicate:
            # Point to the same file field and size
            serializer.save(
                file=duplicate.file,
                size=duplicate.size,
                file_type=file_type,
                file_hash=file_hash
            )
        else:
            # Save new file
            serializer.save(
                size=uploaded_file.size,
                file_type=file_type,
                file_hash=file_hash
            )
        print("File saved...")
    
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.info('API: Delete file request received', {
            'file_id': instance.id,
            'filename': instance.original_filename,
            'user': request.user.username if request.user.is_authenticated else 'anonymous'
        })
        try:
            response = super().destroy(request, *args, **kwargs)
            logger.info('API: Delete file success', {
                'status_code': response.status_code,
                'file_id': instance.id
            })
            return response
        except Exception as e:
            logger.error('API: Delete file error', {
                'error': str(e),
                'traceback': traceback.format_exc()
            })
            raise

@api_view(['POST'])
def log_frontend(request):
    try:
        message = request.data.get('message')
        if not message:
            logger.warning("Received empty log message from frontend")
            return Response({'error': 'No message provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        logger.info(f"Frontend: {message}")
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error handling frontend log: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Internal server error', 'details': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint to verify the backend server is running.
    """
    return Response({'status': 'ok', 'message': 'Backend server is running'}, status=status.HTTP_200_OK)
