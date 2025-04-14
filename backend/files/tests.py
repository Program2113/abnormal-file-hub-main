# tests.py
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from myapp.models import File
from myapp.utils import calculate_storage_savings

class FileModelTestCase(TestCase):
    def test_duplicate_file_points_to_same_file(self):
        """
        When two files with identical content are uploaded,
        the second one should point to the same file reference.
        """
        file_content = b"identical file content for deduplication test"
        
        file1 = SimpleUploadedFile("test1.txt", file_content, content_type="text/plain")
        obj1 = File(
            file=file1,
            original_filename="test1.txt",
            file_type="text/plain",
            size=len(file_content)
        )
        obj1.save()

        file2 = SimpleUploadedFile("test2.txt", file_content, content_type="text/plain")
        obj2 = File(
            file=file2,
            original_filename="test2.txt",
            file_type="text/plain",
            size=len(file_content)
        )
        obj2.save()

        # Verify that both objects have identical file hash
        self.assertEqual(obj1.file_hash, obj2.file_hash,
                         "The file hash should be identical for duplicate files.")
        # Verify that both objects reference the same physical file path
        self.assertEqual(obj1.file.name, obj2.file.name,
                         "Duplicate files should share the same physical file reference.")

    def test_unique_file_does_not_deduplicate(self):
        """
        Files with different content should be stored separately.
        """
        file_content1 = b"unique file content 1"
        file1 = SimpleUploadedFile("unique1.txt", file_content1, content_type="text/plain")
        obj1 = File(
            file=file1,
            original_filename="unique1.txt",
            file_type="text/plain",
            size=len(file_content1)
        )
        obj1.save()

        file_content2 = b"unique file content 2"
        file2 = SimpleUploadedFile("unique2.txt", file_content2, content_type="text/plain")
        obj2 = File(
            file=file2,
            original_filename="unique2.txt",
            file_type="text/plain",
            size=len(file_content2)
        )
        obj2.save()

        self.assertNotEqual(obj1.file_hash, obj2.file_hash,
                            "Unique files should have different file hashes.")
        self.assertNotEqual(obj1.file.name, obj2.file.name,
                            "Unique files should not share the same physical file reference.")

    def test_metadata_preserved(self):
        """
        Ensure that metadata is correctly stored for an upload.
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

    def test_storage_savings_calculation(self):
        """
        Validate that storage savings are correctly calculated.
        For a duplicate file group, only one physical file is stored.
        """
        # Upload a file (first instance)
        file_content = b"storage savings test content"
        file1 = SimpleUploadedFile("savings1.txt", file_content, content_type="text/plain")
        obj1 = File(
            file=file1,
            original_filename="savings1.txt",
            file_type="text/plain",
            size=len(file_content)
        )
        obj1.save()

        # Upload a duplicate of the file (second instance)
        file2 = SimpleUploadedFile("savings2.txt", file_content, content_type="text/plain")
        obj2 = File(
            file=file2,
            original_filename="savings2.txt",
            file_type="text/plain",
            size=len(file_content)
        )
        obj2.save()

        # Calculate expected savings: (2 - 1) * file size.
        expected_savings = (2 - 1) * len(file_content)
        actual_savings = calculate_storage_savings()
        self.assertEqual(actual_savings, expected_savings,
                         "Storage savings should be correctly calculated based on duplicate records.")
