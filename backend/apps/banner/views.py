from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from common.mixins import ResponseEnvelopeMixin
from .models import Banner
from .serializers import BannerSerializer

class BannerViewSet(ResponseEnvelopeMixin, viewsets.ModelViewSet):
    """
    ViewSet quản lý Banner.
    - Public: Xem danh sách banner đang active (GET).
    - Admin: Toàn quyền (POST, PUT, DELETE, xem toàn bộ).
    """
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'position', 'show_in_home']
    search_fields = ['title', 'description', 'link_url']
    ordering_fields = ['sort_order', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return Banner.objects.all()
        # Đối với public user, chỉ trả về các banner đang active
        return Banner.objects.filter(is_active=True)
