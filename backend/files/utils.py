# utils.py
from django.db.models import Count, F, Sum
from .models import File

def calculate_storage_savings():
    """
    Calculate total storage savings (in bytes) due to deduplication.
    For each group of File records with the same file_hash,
    only one physical file is stored. Thus, for a group with n records,
    savings = (n - 1) * file_size (where file_size is the size of the physical file).
    Returns the total savings in bytes.
    """
    print("Calculating storage savings...")
    
    groups = (
        File.objects.values('file_hash')
        .annotate(count=Count('id'), file_size=F('size'))
        .filter(count__gt=1)
    )
    total_savings = 0
    for group in groups:
        total_savings += (group['count'] - 1) * group['file_size']
    print("Total savings:", total_savings, "bytes")
    return total_savings

def get_file_stats():
    """
    Return total number of uploaded files and total size (in MB).
    """
    total_files = File.objects.count()
    total_size_bytes = File.objects.aggregate(total=Sum('size'))['total'] or 0
    total_size_mb = total_size_bytes / (1024 ** 2)
    print("Total files:", total_files)
    print("Total size:", total_size_mb, "MB")
    return total_files, total_size_mb
