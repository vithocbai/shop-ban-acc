from django.db import models
from django.conf import settings
from common.models import TimestampedModel

class Notification(TimestampedModel):
    """
    Hệ thống thông báo cho người dùng.
    """
    
    class Type(models.TextChoices):
        SYSTEM = 'SYSTEM', 'Hệ thống'
        PAYMENT = 'PAYMENT', 'Thanh toán'
        ORDER = 'ORDER', 'Đơn hàng'
        PROMOTION = 'PROMOTION', 'Khuyến mãi'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        verbose_name="Người nhận"
    )
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    content = models.TextField(verbose_name="Nội dung")
    type = models.CharField(
        max_length=50, 
        choices=Type.choices, 
        default=Type.SYSTEM,
        verbose_name="Loại thông báo"
    )
    is_read = models.BooleanField(default=False, verbose_name="Đã đọc")

    class Meta:
        verbose_name = "Thông báo"
        verbose_name_plural = "Danh sách thông báo"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"
