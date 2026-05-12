from rest_framework import viewsets, permissions
from .models import Game
from .serializers import GameSerializer

class GameViewSet(viewsets.ModelViewSet):
    """
    ViewSet quản lý danh sách Game.
    - Public: Chỉ được xem danh sách (list) và chi tiết (retrieve) các game ACTIVE.
    - Admin: Có toàn quyền CRUD.
    """
    queryset = Game.objects.filter(deleted_at__isnull=True)
    serializer_class = GameSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Đối với user thường, chỉ hiện game ACTIVE
        if not self.request.user.is_staff:
            queryset = queryset.filter(status=Game.Status.ACTIVE)
        return queryset
