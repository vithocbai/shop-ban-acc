import io
from PIL import Image
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class ImageUploadTests(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            username="admin_user",
            email="admin@gamemarket.com",
            password="adminpassword123",
            role="ADMIN"
        )
        self.upload_url = reverse('image-upload')

    def generate_image_file(self):
        # Generate a dummy memory image
        file = io.BytesIO()
        image = Image.new('RGBA', size=(100, 100), color=(155, 0, 0))
        image.save(file, 'png')
        file.name = 'test_image.png'
        file.seek(0)
        return file

    def test_upload_image_unauthenticated(self):
        """
        Test that unauthenticated requests are rejected.
        """
        image = self.generate_image_file()
        response = self.client.post(self.upload_url, {'file': image}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_image_success(self):
        """
        Test that authenticated users can upload a valid image file.
        """
        self.client.force_authenticate(user=self.user)
        image = self.generate_image_file()
        response = self.client.post(self.upload_url, {'file': image}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('url', response.data)
        self.assertTrue(response.data['url'].startswith('http'))
        self.assertTrue(response.data['url'].endswith('.png'))

    def test_upload_no_file(self):
        """
        Test that posting without a file returns 400.
        """
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.upload_url, {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_invalid_file_type(self):
        """
        Test that uploading non-image extensions returns 400.
        """
        self.client.force_authenticate(user=self.user)
        file = io.BytesIO(b"fake txt file content")
        file.name = "test_text.txt"
        file.seek(0)
        
        response = self.client.post(self.upload_url, {'file': file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
