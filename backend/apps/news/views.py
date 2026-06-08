from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from common.mixins import ResponseEnvelopeMixin
from .models import Category, Article
from .serializers import CategorySerializer, ArticleListSerializer, ArticleDetailSerializer

class CategoryViewSet(ResponseEnvelopeMixin, viewsets.ModelViewSet):
    """
    ViewSet quản lý Chuyên mục bài viết.
    - Public: Chỉ xem danh sách (GET).
    - Admin: Toàn quyền (POST, PUT, DELETE).
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        # Tại sao phải custom permission? Để khách vãng lai cũng có thể xem danh mục,
        # nhưng chỉ Admin mới có thể thêm/sửa/xoá.
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]


class ArticleViewSet(ResponseEnvelopeMixin, viewsets.ModelViewSet):
    """
    ViewSet quản lý Bài viết/Tin tức.
    """
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'is_visible']
    ordering_fields = ['published_at', 'created_at', 'view_count', 'priority']
    
    # Định tuyến serializer linh hoạt
    def get_serializer_class(self):
        # Tại sao lại dùng 2 serializer khác nhau? 
        # Để API list chạy nhanh, không phải load trường 'content' HTML khổng lồ.
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleDetailSerializer

    def get_permissions(self):
        # Tương tự Category, public chỉ được đọc, Admin có toàn quyền
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Lọc danh sách bài viết theo phân quyền:
        - Admin: Nhìn thấy tất cả (cả bản nháp DRAFT, cả bài viết bị ẩn).
        - Public: Chỉ nhìn thấy bài viết PUBLISHED và đang is_visible = True.
        """
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            queryset = Article.objects.all()
        else:
            queryset = Article.objects.filter(status=Article.Status.PUBLISHED, is_visible=True)
            
        # Tìm kiếm text: theo tiêu đề hoặc slug
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(slug__icontains=search_query)
            )
            
        return queryset

    def retrieve(self, request, *args, **kwargs):
        """
        Override hàm retrieve để tự động tăng lượt xem (view_count).
        Tại sao làm ở đây? Bất cứ ai bấm vào xem chi tiết bài viết qua API này
        thì lượt xem sẽ tăng lên 1 một cách tự động.
        """
        instance = self.get_object()
        # Tăng view_count lên 1
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        from rest_framework.response import Response
        return Response({
            "success": True,
            "message": "Lấy thông tin bài viết thành công",
            "data": serializer.data
        })
