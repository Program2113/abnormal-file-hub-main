# utils.py
import hashlib

def compute_file_hash(file_obj):
    """
    Compute and return the SHA256 hash for the given file object.
    The file pointer is expected to be at the beginning of the file,
    and this function will iterate over the file in chunks.
    """
    file_obj.seek(0)
    hasher = hashlib.sha256()
    for chunk in file_obj.chunks():
        hasher.update(chunk)
    # Return the hexadecimal digest.
    return hasher.hexdigest()
