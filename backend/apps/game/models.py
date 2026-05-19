from django.db import models
from django.utils.text import slugify
from common.models import TimestampedModel, SoftDeleteModel

class Game(TimestampedModel, SoftDeleteModel):
    """
    Model quản lý các loại Game trong hệ thống.
    Hỗ trợ hiển thị trang chủ, danh mục và cấu hình giao diện riêng cho từng game.
    """
    
    # Định nghĩa các trạng thái hoạt động của trò chơi
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Đang hoạt động'
        HIDDEN = 'HIDDEN', 'Tạm ẩn'
        MAINTENANCE = 'MAINTENANCE', 'Bảo trì'

    # Tên hiển thị của game
    name = models.CharField(max_length=100, verbose_name="Tên game")
    
    # Slug phục vụ SEO URL, duy nhất trong hệ thống
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug (đường dẫn)")
    
    # Đường dẫn ảnh icon, đổi từ TextField thành URLField, bỏ null=True và dùng default='' theo chuẩn Django
    icon = models.URLField(max_length=500, blank=True, default='', verbose_name="Icon URL")
    
    # Đường dẫn ảnh bìa lớn, đổi sang URLField và tránh dùng null=True
    banner = models.URLField(max_length=500, blank=True, default='', verbose_name="Banner URL")
    
    # Đường dẫn ảnh thumbnail, đổi sang URLField và tránh dùng null=True
    thumbnail = models.URLField(max_length=500, blank=True, default='', verbose_name="Thumbnail URL")
    
    # Mô tả về game, không dùng null=True cho trường văn bản
    description = models.TextField(blank=True, default='', verbose_name="Mô tả")
    
    # Màu giao diện riêng cho từng game
    theme_color = models.CharField(max_length=20, default="#008BFF", verbose_name="Màu chủ đạo")
    
    # Số nguyên dương biểu diễn thứ tự sắp xếp hiển thị
    sort_order = models.PositiveIntegerField(default=0, verbose_name="Thứ tự sắp xếp")
    
    # Đánh dấu game có nổi bật/hot hay không
    is_hot = models.BooleanField(default=False, verbose_name="Game nổi bật")
    
    # Trạng thái hiện tại của game
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
        # Tự động phát sinh slug từ tên game nếu để trống
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
