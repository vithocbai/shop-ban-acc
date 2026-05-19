from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Game
from .serializers import GameSerializer


class GameViewSet(viewsets.ModelViewSet):
    """
    ViewSet quản lý danh sách Game.
    - Public: Chỉ được xem danh sách (list) và chi tiết (retrieve) các game ACTIVE.
    - Admin: Có toàn quyền CRUD.
    """
    # Lấy toàn bộ game chưa bị xóa mềm
    queryset = Game.objects.filter(deleted_at__isnull=True)
    serializer_class = GameSerializer
    
    # Cấu hình bộ lọc, tìm kiếm và sắp xếp
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # Lọc theo trạng thái hoạt động và trạng thái nổi bật (is_hot)
    filterset_fields = ['status', 'is_hot']
    # Tìm kiếm theo tên, slug, hoặc mô tả của game
    search_fields = ['name', 'slug', 'description']
    # Sắp xếp theo thứ tự hiển thị hoặc ngày tạo
    ordering_fields = ['sort_order', 'created_at']
    # Sử dụng trường 'slug' thay cho 'id' làm khóa chính khi gọi API chi tiết
    lookup_field = 'slug'

    def get_permissions(self):
        # Cho phép mọi người (Anonymous) truy cập xem danh sách và chi tiết game
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Các hành động tạo, sửa, xóa (POST, PUT, DELETE) yêu cầu quyền Admin
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Đối với người dùng không phải là nhân viên (Admin/Staff), chỉ trả về các game ở trạng thái ACTIVE
        if not self.request.user.is_staff:
            queryset = queryset.filter(status=Game.Status.ACTIVE)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Thực hiện phân trang nếu được cấu hình và không tắt phân trang
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # Nếu phân trang bị tắt (no_pagination=true), bọc danh sách vào Response Envelope chuẩn
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Lấy danh sách thành công",
            "data": serializer.data
        })



