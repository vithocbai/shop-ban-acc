from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.game.models import Game

User = get_user_model()

class GamePaginationTests(APITestCase):
    """
    Hộp kiểm thử (Test Case) cho tính năng phân trang danh sách Game.
    Kiểm thử cấu trúc phản hồi Envelope chuẩn, khả năng phân trang và tùy chọn tắt phân trang.
    """

    def setUp(self):
        # Thiết lập dữ liệu giả lập ban đầu cho các test cases
        self.admin_user = User.objects.create_superuser(
            username="admin",
            email="admin@shopgame.com",
            password="adminpassword123",
            role="ADMIN"
        )
        # Tạo 5 game hoạt động (ACTIVE) trong hệ thống
        self.games = []
        for i in range(1, 6):
            game = Game.objects.create(
                name=f"Game test {i}",
                slug=f"game-test-{i}",
                status=Game.Status.ACTIVE,
                sort_order=i
            )
            self.games.append(game)

        # URL của API lấy danh sách game (tương ứng với hành động list trong GameViewSet)
        self.list_url = reverse('game-list')

    def test_get_games_list_paginated_success(self):
        """
        Kiểm tra cấu trúc dữ liệu trả về khi gọi danh sách game có phân trang (mặc định).
        """
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Kiểm tra cấu trúc Response Envelope chuẩn hóa
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], "Lấy danh sách thành công")
        
        # Kiểm tra nội dung của trường data
        data_payload = response.data['data']
        self.assertIn('items', data_payload)
        self.assertIn('total', data_payload)
        self.assertIn('page', data_payload)
        self.assertIn('page_size', data_payload)
        
        # Xác thực giá trị trả về khớp với số lượng game và cấu hình
        self.assertEqual(data_payload['total'], 5)
        self.assertEqual(data_payload['page'], 1)
        self.assertEqual(data_payload['page_size'], 10)
        self.assertEqual(len(data_payload['items']), 5)

    def test_custom_page_size(self):
        """
        Kiểm tra tùy chỉnh kích thước trang thông qua query param `page_size`.
        """
        # Gọi API với trang tối đa 2 bản ghi
        response = self.client.get(self.list_url, {'page_size': 2})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data_payload = response.data['data']
        
        # Kiểm tra số lượng phần tử trả về trên trang hiện tại bằng 2
        self.assertEqual(len(data_payload['items']), 2)
        # Tổng số lượng bản ghi trên toàn hệ thống vẫn phải bằng 5
        self.assertEqual(data_payload['total'], 5)
        self.assertEqual(data_payload['page_size'], 2)

    def test_no_pagination_toggle(self):
        """
        Kiểm tra tùy chọn tắt phân trang thông qua query param `no_pagination=true`.
        """
        # Gọi API với tham số tắt phân trang
        response = self.client.get(self.list_url, {'no_pagination': 'true'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Khi tắt phân trang, dữ liệu trả về nằm trực tiếp trong 'data' dưới dạng danh sách thô
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], "Lấy danh sách thành công")
        
        # Trường 'data' phải là một mảng (list) chứa tất cả 5 game trực tiếp chứ không nằm trong 'items'
        self.assertIsInstance(response.data['data'], list)
        self.assertEqual(len(response.data['data']), 5)
