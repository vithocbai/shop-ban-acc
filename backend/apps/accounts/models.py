from django.db import models
from django.utils.text import slugify
from django.conf import settings
from apps.common.models import TimestampedModel, SoftDeleteModel
from apps.games.models import Game

class Account(TimestampedModel, SoftDeleteModel):
    """
    Model quản lý thông tin tài khoản game đăng bán.
    Sử dụng JSONB (account_data) để lưu trữ các thuộc tính linh hoạt theo từng loại game.
    """
    
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Đang bán'
        RESERVED = 'RESERVED', 'Đang giữ chỗ'
        SOLD = 'SOLD', 'Đã bán'
        LOCKED = 'LOCKED', 'Đang khóa'
        HIDDEN = 'HIDDEN', 'Tạm ẩn'

    game = models.ForeignKey(Game, on_delete=models.PROTECT, related_name='accounts', verbose_name="Trò chơi")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề bài đăng")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="Slug")
    account_code = models.CharField(max_length=50, unique=True, verbose_name="Mã số tài khoản")
    thumbnail = models.TextField(null=True, blank=True, verbose_name="Ảnh đại diện")
    
    price = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Giá bán")
    original_price = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True, verbose_name="Giá gốc")
    discount_percent = models.IntegerField(default=0, verbose_name="Phần trăm giảm giá")
    
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.AVAILABLE,
        verbose_name="Trạng thái"
    )
    
    login_type = models.CharField(max_length=50, null=True, blank=True, verbose_name="Loại đăng nhập")
    account_type = models.CharField(max_length=50, null=True, blank=True, verbose_name="Loại tài khoản")
    
    short_description = models.TextField(null=True, blank=True, verbose_name="Mô tả ngắn")
    description = models.TextField(null=True, blank=True, verbose_name="Mô tả chi tiết")
    
    # Dữ liệu động (Rank, Skin, Server...) lưu dưới dạng JSON
    account_data = models.JSONField(default=dict, verbose_name="Dữ liệu game (JSON)")
    
    sold_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian bán")
    is_featured = models.BooleanField(default=False, verbose_name="Nổi bật")
    is_hot = models.BooleanField(default=False, verbose_name="Hot")
    views = models.IntegerField(default=0, verbose_name="Lượt xem")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_accounts',
        verbose_name="Người đăng"
    )

    class Meta:
        verbose_name = "Tài khoản game"
        verbose_name_plural = "Danh sách tài khoản"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.account_code}] {self.title}"


class AccountImage(models.Model):
    """
    Bộ sưu tập ảnh chi tiết cho tài khoản.
    """
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='images', verbose_name="Tài khoản")
    image_url = models.TextField(verbose_name="Đường dẫn ảnh")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ảnh tài khoản"
        verbose_name_plural = "Bộ sưu tập ảnh"
        ordering = ['sort_order']
