from django.db import models
from common.models import TimestampedModel

class Banner(TimestampedModel):
    class PositionChoices(models.TextChoices):
        HOME_TOP = 'HOME_TOP', 'Trang chủ - Top'
        HOME_MIDDLE = 'HOME_MIDDLE', 'Trang chủ - Giữa'
        HOME_BOTTOM = 'HOME_BOTTOM', 'Trang chủ - Dưới'
        SIDEBAR = 'SIDEBAR', 'Sidebar'

    title = models.CharField(max_length=255, verbose_name="Tiêu đề banner")
    position = models.CharField(max_length=50, choices=PositionChoices.choices, default=PositionChoices.HOME_TOP, verbose_name="Vị trí hiển thị")
    link_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Liên kết chuyển hướng")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự hiển thị")
    image_url = models.CharField(max_length=500, verbose_name="Đường dẫn ảnh")
    description = models.TextField(blank=True, verbose_name="Mô tả banner")
    
    is_active = models.BooleanField(default=True, verbose_name="Trạng thái hiển thị")
    devices = models.JSONField(default=list, verbose_name="Thiết bị hiển thị")
    show_in_home = models.BooleanField(default=True, verbose_name="Hiển thị trong trang chủ")
    
    start_date = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian bắt đầu")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian kết thúc")
    note = models.TextField(blank=True, verbose_name="Ghi chú")

    class Meta:
        db_table = 'banner'
        ordering = ['sort_order', '-created_at']
        verbose_name = 'Banner'
        verbose_name_plural = 'Banners'

    def __str__(self):
        return self.title
