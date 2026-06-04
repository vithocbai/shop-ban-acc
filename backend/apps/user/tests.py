from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminUserTests(APITestCase):
    def setUp(self):
        # Create an admin user
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            username='admin_test',
            password='AdminPassword123'
        )
        # Create a standard user for testing update/delete
        self.target_user = User.objects.create_user(
            email='user@example.com',
            username='user_test',
            password='UserPassword123',
            role='USER',
            status='ACTIVE'
        )

    def test_admin_can_create_user(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_user_list')
        data = {
            'email': 'newuser@example.com',
            'username': 'new_user',
            'password': 'SecurePassword123',
            'role': 'MODERATOR',
            'status': 'ACTIVE',
            'first_name': 'New',
            'last_name': 'User',
            'phone': '0123456789'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(email='newuser@example.com').count(), 1)
        
        new_user = User.objects.get(email='newuser@example.com')
        self.assertEqual(new_user.role, 'MODERATOR')
        self.assertEqual(new_user.first_name, 'New')
        self.assertEqual(new_user.phone, '0123456789')
        self.assertTrue(new_user.check_password('SecurePassword123'))

    def test_non_admin_cannot_create_user(self):
        self.client.force_authenticate(user=self.target_user)
        url = reverse('admin_user_list')
        data = {
            'email': 'newuser2@example.com',
            'username': 'new_user_2',
            'password': 'SecurePassword123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_update_user_role_and_status(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_user_detail', kwargs={'pk': self.target_user.pk})
        data = {
            'role': 'ADMIN',
            'status': 'BANNED'
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.target_user.refresh_from_db()
        self.assertEqual(self.target_user.role, 'ADMIN')
        self.assertEqual(self.target_user.status, 'BANNED')
        self.assertTrue(response.data['success'])

    def test_non_admin_cannot_update_user(self):
        self.client.force_authenticate(user=self.target_user)
        url = reverse('admin_user_detail', kwargs={'pk': self.admin_user.pk})
        data = {
            'role': 'SUPER_ADMIN'
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_user(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_user_detail', kwargs={'pk': self.target_user.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.target_user.refresh_from_db()
        # SoftDeleteModel sets deleted_at
        self.assertIsNotNone(self.target_user.deleted_at)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], "Xóa người dùng thành công")

    def test_non_admin_cannot_delete_user(self):
        self.client.force_authenticate(user=self.target_user)
        url = reverse('admin_user_detail', kwargs={'pk': self.admin_user.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
