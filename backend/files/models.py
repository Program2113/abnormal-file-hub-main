import os
import uuid
from django.db import models
from .utils import compute_file_hash  # Import the hash function from utils.py

# Optional: Customize the file upload path
def file_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    # Generate a unique filename using UUID for new files.
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
        # Calculate the hash if not already set.
        if not self.file_hash:
            self.file.seek(0)
            self.file_hash = compute_file_hash(self.file)
            self.file.seek(0)  # Reset file pointer after computing the hash.

        # Check for an existing file with the same hash.
        duplicate = File.objects.filter(file_hash=self.file_hash).first()
        if duplicate:
            # Reuse the file field from the duplicate record,
            # so both records reference the same physical file.
            self.file = duplicate.file

        # Set the file size (and optionally file_type) based on this upload.
        self.size = self.file.size

        # Save the model; auto_now_add takes care of the uploaded_at timestamp.
        super().save(*args, **kwargs)
