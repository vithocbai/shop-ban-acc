from django.db import models
from django.conf import settings
from common.models import TimestampedModel
from apps.account.models import Account

class Order(TimestampedModel):
    """
    Quản lý thông tin đơn hàng mua tài khoản.
    """
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Chờ thanh toán'
        PAID = 'PAID', 'Đã thanh toán'
        FAILED = 'FAILED', 'Thất bại'
        REFUNDED = 'REFUNDED', 'Đã hoàn tiền'

    class DeliveryStatus(models.TextChoices):
        PENDING = 'PENDING', 'Chờ bàn giao'
        DELIVERED = 'DELIVERED', 'Đã bàn giao'
        FAILED = 'FAILED', 'Gặp lỗi'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='orders',
        verbose_name="Người mua"
    )
    order_code = models.CharField(max_length=50, unique=True, verbose_name="Mã đơn hàng")
    total_price = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Tổng tiền")
    
    payment_status = models.CharField(
        max_length=20, 
        choices=PaymentStatus.choices, 
        default=PaymentStatus.PENDING,
        verbose_name="Trạng thái thanh toán"
    )
    delivery_status = models.CharField(
        max_length=20, 
        choices=DeliveryStatus.choices, 
        default=DeliveryStatus.PENDING,
        verbose_name="Trạng thái bàn giao"
    )
    
    note = models.TextField(null=True, blank=True, verbose_name="Ghi chú")

    class Meta:
        verbose_name = "Đơn hàng"
        verbose_name_plural = "Danh sách đơn hàng"
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_code} - {self.total_price}"


class OrderItem(models.Model):
    """
    Chi tiết từng tài khoản trong đơn hàng.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name="Đơn hàng")
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='order_items', verbose_name="Tài khoản")
    price = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Giá lúc mua")
    
    # Thông tin tài khoản được bàn giao (Email/Pass/OTP) - Sẽ được mã hóa trong thực tế
    delivery_data = models.JSONField(default=dict, blank=True, verbose_name="Dữ liệu bàn giao")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Chi tiết đơn hàng"
        verbose_name_plural = "Chi tiết đơn hàng"

    def __str__(self):
        return f"Item {self.account.account_code} for Order {self.order.order_code}"
