from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Account
from .serializers import AccountListSerializer, AccountDetailSerializer, AccountWriteSerializer
from common.mixins import ResponseEnvelopeMixin


class AccountViewSet(ResponseEnvelopeMixin, viewsets.ModelViewSet):
    """
    ViewSet quản lý danh sách tài khoản game.
    - Public: Chỉ được xem danh sách (list) và chi tiết (retrieve) các account AVAILABLE.
    - Admin: Có toàn quyền CRUD (xem tất cả trạng thái).
    - Hỗ trợ dual lookup: tìm theo ID (số) hoặc Slug (chuỗi).
    """
    queryset = Account.objects.filter(deleted_at__isnull=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['game', 'status', 'is_hot', 'is_featured']
    search_fields = ['title', 'account_code', 'description']
    ordering_fields = ['price', 'created_at', 'views']
    lookup_field = 'slug'

    def get_object(self):
        """
        Override lookup: Nếu giá trị là số nguyên dương → tìm theo id.
        Nếu không → tìm theo slug. (Giống pattern đã fix cho GameViewSet)
        """
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
            raise Http404("Không tìm thấy tài khoản nào khớp với ID hoặc Slug được cấp.")

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AccountDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return AccountWriteSerializer
        return AccountListSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Đối với user thường, chỉ hiện account AVAILABLE
        if not self.request.user.is_staff:
            queryset = queryset.filter(status=Account.Status.AVAILABLE)
        
        # Lọc theo game_slug nếu có truyền vào query params
        game_slug = self.request.query_params.get('game_slug')
        if game_slug:
            queryset = queryset.filter(game__slug=game_slug)
            
        return queryset.select_related('game').prefetch_related('images')

    def perform_create(self, serializer):
        """Tự động gán người tạo (created_by) là user hiện tại."""
        serializer.save(created_by=self.request.user)
