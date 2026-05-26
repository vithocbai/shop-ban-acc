from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Game
from .serializers import GameSerializer
from common.mixins import ResponseEnvelopeMixin


class GameViewSet(ResponseEnvelopeMixin, viewsets.ModelViewSet):
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

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view string.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )

        lookup_value = self.kwargs[lookup_url_kwarg]

        # 1. Thử tìm kiếm theo ID nếu giá trị lookup là số nguyên dương
        if lookup_value.isdigit():
            try:
                obj = queryset.get(id=int(lookup_value))
                self.check_object_permissions(self.request, obj)
                return obj
            except queryset.model.DoesNotExist:
                pass

        # 2. Nếu không phải số hoặc tìm theo ID không ra, tìm theo slug
        try:
            obj = queryset.get(slug=lookup_value)
            self.check_object_permissions(self.request, obj)
            return obj
        except queryset.model.DoesNotExist:
            from django.http import Http404
            raise Http404("Không tìm thấy game nào khớp với ID hoặc Slug được cấp.")

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



