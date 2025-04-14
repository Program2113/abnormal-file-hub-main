# tests.py
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from myapp.models import File  # Adjust the import based on your app name


class FileModelTestCase(TestCase):
    def test_duplicate_file_points_to_same_file(self):
        """
        Test that when two files with identical content are uploaded,
        the second one deduplicates and points to the same file reference.
        """
        # Content for both files (identical content)
        file_content = b"identical file content for deduplication test"
        
        # Create the first file upload.
        file1 = SimpleUploadedFile("test1.txt", file_content, content_type="text/plain")
        obj1 = File(
            file=file1,
            original_filename="test1.txt",
            file_type="text/plain",
            size=len(file_content)
        )
        obj1.save()

        # Create the second file upload with different original filename
        # but the same content.
        file2 = SimpleUploadedFile("test2.txt", file_content, content_type="text/plain")
        obj2 = File(
            file=file2,
            original_filename="test2.txt",
            file_type="text/plain",
            size=len(file_content)
        )
        obj2.save()

        # Verify that both objects have the same file hash.
        self.assertEqual(obj1.file_hash, obj2.file_hash,
                         "The file hash should be identical for duplicate files.")
        
        # Verify that the file field is re-used (i.e. the stored file path is identical).
        self.assertEqual(obj1.file.name, obj2.file.name,
                         "Duplicate files should share the same physical file reference.")

    def test_unique_file_does_not_deduplicate(self):
        """
        Test that files with different content are stored separately.
        """
        # Create first unique file.
        file_content1 = b"unique file content 1"
        file1 = SimpleUploadedFile("unique1.txt", file_content1, content_type="text/plain")
        obj1 = File(
            file=file1,
            original_filename="unique1.txt",
            file_type="text/plain",
            size=len(file_content1)
        )
        obj1.save()

        # Create second unique file with different content.
        file_content2 = b"unique file content 2"
        file2 = SimpleUploadedFile("unique2.txt", file_content2, content_type="text/plain")
        obj2 = File(
            file=file2,
            original_filename="unique2.txt",
            file_type="text/plain",
            size=len(file_content2)
        )
        obj2.save()

        # The file hashes should be different.
        self.assertNotEqual(obj1.file_hash, obj2.file_hash,
                            "Unique files should have different file hashes.")
        
        # The stored file paths should be different.
        self.assertNotEqual(obj1.file.name, obj2.file.name,
                            "Unique files should not share the same physical file reference.")

    def test_metadata_preserved(self):
        """
        Test that metadata is stored correctly for an upload,
        regardless of deduplication.
        """
        file_content = b"metadata test content"
        file_instance = SimpleUploadedFile("meta.txt", file_content, content_type="text/plain")
        obj = File(
            file=file_instance,
            original_filename="meta.txt",
            file_type="text/plain",
            size=len(file_content)
        )
        obj.save()

        # Check that the metadata fields are stored properly.
        self.assertEqual(obj.original_filename, "meta.txt",
                         "Original filename should match the input value.")
        self.assertEqual(obj.file_type, "text/plain",
                         "File type should match the input value.")
        self.assertEqual(obj.size, len(file_content),
                         "File size should match the size of the uploaded content.")
        self.assertIsNotNone(obj.uploaded_at,
                             "Uploaded_at should be automatically set on save.")
        self.assertTrue(obj.file.name.startswith("uploads/"),
                        "File path should be set according to the 'upload_to' function.")

