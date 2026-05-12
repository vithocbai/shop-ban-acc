from django.db import models
from django.utils.text import slugify
from apps.common.models import TimestampedModel, SoftDeleteModel

class Game(TimestampedModel, SoftDeleteModel):
    """
    Model quản lý các loại Game trong hệ thống.
    Hỗ trợ hiển thị trang chủ, danh mục và cấu hình giao diện riêng cho từng game.
    """
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Đang hoạt động'
        HIDDEN = 'HIDDEN', 'Tạm ẩn'
        MAINTENANCE = 'MAINTENANCE', 'Bảo trì'

    name = models.CharField(max_length=100, verbose_name="Tên game")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug (đường dẫn)")
    icon = models.TextField(null=True, blank=True, verbose_name="Icon URL")
    banner = models.TextField(null=True, blank=True, verbose_name="Banner URL")
    thumbnail = models.TextField(null=True, blank=True, verbose_name="Thumbnail URL")
    description = models.TextField(null=True, blank=True, verbose_name="Mô tả")
    theme_color = models.CharField(max_length=20, default="#008BFF", verbose_name="Màu chủ đạo")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự sắp xếp")
    is_hot = models.BooleanField(default=False, verbose_name="Game nổi bật")
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.ACTIVE,
        verbose_name="Trạng thái"
    )

    class Meta:
        verbose_name = "Trò chơi"
        verbose_name_plural = "Danh sách trò chơi"
        ordering = ['sort_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
