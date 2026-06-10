from rest_framework import serializers
from .models import Category, Article

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer cho Chuyên mục tin tức.
    """
    class Meta:
        model = Category
        fields = ['id', 'title', 'slug', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ArticleAuthorSerializer(serializers.Serializer):
    """
    Serializer inline để format lại thông tin tác giả.
    Tại sao cần cái này? Yêu cầu UI của trang quản trị cần hiển thị tên hiển thị (fullName)
    thay vì chỉ trả về user_id khô khan.
    """
    id = serializers.IntegerField()
    # Nếu User model không có trường full_name, ta trả về username hoặc email làm tên hiển thị tạm thời
    # (Tuỳ thuộc vào cấu trúc custom User của hệ thống)
    fullName = serializers.SerializerMethodField()

    def get_fullName(self, obj):
        # Trả về full_name nếu có, hoặc fallback về username
        if hasattr(obj, 'first_name') and hasattr(obj, 'last_name') and (obj.first_name or obj.last_name):
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.username


class ArticleListSerializer(serializers.ModelSerializer):
    """
    Serializer dùng để lấy danh sách bài viết.
    Tại sao phải tách riêng ListSerializer? 
    Để giảm dung lượng payload khi lấy danh sách (bỏ đi trường 'content' rất nặng),
    tăng tốc độ tải trang đáng kể cho Admin và Public.
    """
    author = ArticleAuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'category', 'category_id', 'author', 
            'thumbnail', 'short_description', 'status', 'is_visible',
            'published_at', 'display_until', 'priority', 'view_count', 'created_at'
        ]
        read_only_fields = ['id', 'view_count', 'created_at']


class ArticleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer dùng khi xem chi tiết/sửa một bài viết.
    Chứa đầy đủ tất cả các trường (content, SEO meta,...).
    """
    author = ArticleAuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'category', 'category_id', 'author', 
            'thumbnail', 'short_description', 'content', 
            'status', 'is_visible', 'published_at', 'display_until', 'priority',
            'meta_title', 'meta_description', 'view_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'view_count', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Tự động gắn user hiện tại vào field author khi tạo bài viết
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)
