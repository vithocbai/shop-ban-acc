from django.db import models
from django.conf import settings
from django.utils.text import slugify
from common.models import TimestampedModel

class Category(TimestampedModel):
    """
    Model quản lý chuyên mục bài viết (VD: Khuyến mãi, Hướng dẫn, Cập nhật).
    """
    title = models.CharField(max_length=255, verbose_name="Tên chuyên mục")
    slug = models.SlugField(max_length=255, unique=True, blank=True, verbose_name="URL thân thiện")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả chuyên mục")

    class Meta:
        verbose_name = "Chuyên mục"
        verbose_name_plural = "Danh mục bài viết"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Tự động tạo slug nếu trống để chuẩn SEO
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Article(TimestampedModel):
    """
    Model quản lý bài viết/tin tức.
    Kế thừa TimestampedModel để có sẵn created_at và updated_at.
    """
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Lưu nháp'
        PUBLISHED = 'PUBLISHED', 'Đăng ngay'

    # 1. Thông tin cơ bản
    title = models.CharField(max_length=255, verbose_name="Tiêu đề tin tức")
    slug = models.SlugField(max_length=255, unique=True, blank=True, verbose_name="URL thân thiện")
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='articles', 
        verbose_name="Danh mục"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='articles', 
        verbose_name="Tác giả"
    )
    thumbnail = models.TextField(blank=True, null=True, verbose_name="Ảnh đại diện")
    short_description = models.CharField(max_length=300, blank=True, verbose_name="Mô tả ngắn")
    content = models.TextField(verbose_name="Nội dung chi tiết")

    # 2. Cài đặt xuất bản
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PUBLISHED, verbose_name="Trạng thái")
    is_visible = models.BooleanField(default=True, verbose_name="Trạng thái hiển thị")
    published_at = models.DateTimeField(blank=True, null=True, verbose_name="Thời gian đăng")
    display_until = models.DateTimeField(blank=True, null=True, verbose_name="Hiển thị đến")
    priority = models.IntegerField(default=0, verbose_name="Độ ưu tiên")

    # 3. SEO (Tùy chọn)
    meta_title = models.CharField(max_length=60, blank=True, verbose_name="Thẻ meta title")
    meta_description = models.CharField(max_length=160, blank=True, verbose_name="Thẻ meta description")

    # 4. Hệ thống (Tự động)
    view_count = models.PositiveIntegerField(default=0, verbose_name="Lượt xem")

    class Meta:
        verbose_name = "Bài viết"
        verbose_name_plural = "Danh sách bài viết"
        # Ưu tiên sắp xếp theo priority trước (số lớn hiện lên đầu), sau đó theo ngày xuất bản
        ordering = ['-priority', '-published_at', '-created_at']

    def save(self, *args, **kwargs):
        # Tại sao phải tự generate slug? Giúp giảm thao tác cho người dùng, tối ưu SEO url
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
