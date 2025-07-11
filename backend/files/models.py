# models.py
import os
import uuid
import hashlib
from django.db import models

def compute_file_hash(file_obj):
    """
    Compute and return the SHA256 hash for the given file object.
    The file pointer is expected to be at the beginning of the file.
    """
    file_obj.seek(0)
    hasher = hashlib.sha256()
    for chunk in file_obj.chunks():
        hasher.update(chunk)
    # Return the hexadecimal digest.
    return hasher.hexdigest()

def file_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads', new_filename)

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
    file = models.FileField(upload_to=file_upload_path)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_hash = models.CharField(max_length=64, blank=True)
    # 👇 Added this field to the new version
    content_text = models.TextField(blank=True, null=True, help_text="Extracted text content of the file")

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.original_filename

    # def save(self, *args, **kwargs):
    #     # Set file type based on extension
    #     if not self.file_type:
    #         self.file_type = get_file_type(self.original_filename)
            
    #     # Compute and set file_hash if it's not already set
    #     if not self.file_hash:
    #         self.file.seek(0)
    #         self.file_hash = compute_file_hash(self.file)
    #         self.file.seek(0)  # Reset file pointer after computing the hash

    #     # Check if an identical file exists
    #     duplicate = File.objects.filter(file_hash=self.file_hash).exclude(id=self.id).first()
    #     if duplicate:
    #         # Point to the same physical file
    #         self.file = duplicate.file
    #         # Use the duplicate's size since we're using the same file
    #         self.size = duplicate.size
    #     else:
    #         # Update the file size based on the current file
    #         self.size = self.file.size

    #     super().save(*args, **kwargs)
