# models.py
import os
import uuid
from django.db import models
from .utils import compute_file_hash

def file_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads', new_filename)

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=file_upload_path)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_hash = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.original_filename

    def save(self, *args, **kwargs):
        # Compute and set file_hash if it's not already set.
        if not self.file_hash:
            self.file.seek(0)
            self.file_hash = compute_file_hash(self.file)
            self.file.seek(0)  # Reset file pointer after computing the hash.

        # Check if an identical file exists.
        duplicate = File.objects.filter(file_hash=self.file_hash).first()
        if duplicate:
            # Point to the same physical file.
            self.file = duplicate.file

        # Update the file size based on the current file.
        self.size = self.file.size

        super().save(*args, **kwargs)
