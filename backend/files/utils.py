# utils.py
import hashlib
from django.db.models import Count, F
from myapp.models import File  # Adjust the import based on your app name

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

def calculate_storage_savings():
    """
    Calculate total storage savings (in bytes) due to deduplication.
    For each group of File records with the same file_hash,
    only one physical file is stored. Thus, for a group with n records,
    savings = (n - 1) * file_size (assuming all records have the same file size).
    Returns the total savings in bytes.
    """
    groups = (
        File.objects.values('file_hash')
        .annotate(count=Count('id'), file_size=F('size'))
        .filter(count__gt=1)
    )
    total_savings = 0
    for group in groups:
        total_savings += (group['count'] - 1) * group['file_size']
    return total_savings

def get_file_stats():
    """
    Return total number of uploaded files and total size (in MB).
    """
    total_files = File.objects.count()
    total_size_bytes = File.objects.aggregate(total=Sum('size'))['total'] or 0
    total_size_mb = total_size_bytes / (1024 ** 2)
    return total_files, total_size_mb
