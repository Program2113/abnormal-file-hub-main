# models.py
import os
import uuid
from django.db import models
from .utils import compute_file_hash

def upload_to_hash(instance, filename):
    ext = filename.split('.')[-1]
    return os.path.join('uploads', f"{instance.file_hash}.{ext}")

def get_file_type(filename):
    """
    Determine the file type based on the file extension.
    """
    ext = filename.split('.')[-1].lower()
    
    # Image types
    if ext in ['png', 'jpg', 'jpeg', 'gif', 'heif', 'heic', 'tiff', 'tif']:
        return 'image'
    
    # Document types
    if ext in ['pdf', 'tex', 'odt', 'doc', 'docx']:
        return 'document'
    
    # Text types
    if ext in ['txt', 'md', 'json', 'xml', 'log', 'html', 'yml', 'yaml']:
        return 'text'
    
    # Spreadsheet types
    if ext in ['xlsx', 'csv', 'xls', 'odx', 'ods']:
        return 'spreadsheet'
    
    return 'other'

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=upload_to_hash)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_hash = models.CharField(max_length=64, unique=True, editable=False)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.original_filename

    def save(self, *args, **kwargs):
        # Compute the hash once, before Django writes the file:
        if not self.file_hash:
            self.file_hash = compute_file_hash(self.file)
        # Set file type based on extension
        if not self.file_type:
            self.file_type = get_file_type(self.original_filename)
        self.size = self.file.size
        # let Django write (or reuse) the file at uploads/<hash>.<ext>
        super().save(*args, **kwargs)
