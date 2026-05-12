from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Account
from .serializers import AccountListSerializer, AccountDetailSerializer

class AccountViewSet(viewsets.ModelViewSet):
    """
    ViewSet quản lý danh sách tài khoản game.
    Hỗ trợ lọc theo game, giá, và trạng thái.
    """
    queryset = Account.objects.filter(deleted_at__isnull=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['game', 'status', 'is_hot', 'is_featured']
    search_fields = ['title', 'account_code', 'description']
    ordering_fields = ['price', 'created_at', 'views']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AccountDetailSerializer
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
