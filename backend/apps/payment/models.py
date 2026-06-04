from django.db import models
from django.conf import settings
from common.models import TimestampedModel

class Transaction(TimestampedModel):
    """
    Ghi lại mọi biến động số dư của người dùng.
    Dùng để đối soát và hiển thị lịch sử giao dịch.
    """
    
    class Type(models.TextChoices):
        DEPOSIT = 'DEPOSIT', 'Nạp tiền'
        PURCHASE = 'PURCHASE', 'Mua tài khoản'
        REFUND = 'REFUND', 'Hoàn tiền'
        WITHDRAW = 'WITHDRAW', 'Rút tiền'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Đang xử lý'
        SUCCESS = 'SUCCESS', 'Thành công'
        FAILED = 'FAILED', 'Thất bại'
        CANCELLED = 'CANCELLED', 'Đã hủy'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='transactions',
        verbose_name="Người dùng"
    )
    transaction_code = models.CharField(max_length=50, unique=True, verbose_name="Mã giao dịch")
    type = models.CharField(max_length=50, choices=Type.choices, verbose_name="Loại giao dịch")
    amount = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Số tiền")
    
    # Số dư trước và sau giao dịch để dễ đối soát
    balance_before = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Số dư trước")
    balance_after = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Số dư sau")
    
    payment_method = models.CharField(max_length=50, null=True, blank=True, verbose_name="Phương thức")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUCCESS)
    
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Dữ liệu bổ sung")
    note = models.TextField(null=True, blank=True, verbose_name="Ghi chú")

    class Meta:
        verbose_name = "Giao dịch"
        verbose_name_plural = "Lịch sử giao dịch"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.transaction_code}] {self.user.email} - {self.amount}"


class Deposit(TimestampedModel):
    """
    Yêu cầu nạp tiền từ người dùng.
    Cần Admin phê duyệt (đối với Bank/Momo thủ công).
    """
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Chờ duyệt'
        APPROVED = 'APPROVED', 'Đã duyệt'
        REJECTED = 'REJECTED', 'Đã từ chối'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='deposits',
        verbose_name="Người dùng"
    )
    amount = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Số tiền nạp")
    method = models.CharField(max_length=50, verbose_name="Phương thức nạp")
    
    transaction_image = models.TextField(null=True, blank=True, verbose_name="Ảnh minh chứng (Bill)")
    note = models.TextField(null=True, blank=True, verbose_name="Ghi chú người dùng")
    admin_note = models.TextField(null=True, blank=True, verbose_name="Ghi chú Admin")
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='approved_deposits',
        verbose_name="Người duyệt"
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian duyệt")

    class Meta:
        verbose_name = "Yêu cầu nạp tiền"
        verbose_name_plural = "Danh sách nạp tiền"
        ordering = ['-created_at']

    def __str__(self):
        return f"Deposit {self.amount} - {self.user.email}"

class Card(TimestampedModel):
    """
    Thẻ nạp / Voucher sinh ra cho người dùng nạp tiền.
    """
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Hoạt động'
        USED = 'USED', 'Đã dùng'
        LOCKED = 'LOCKED', 'Đã khóa'

    code = models.CharField(max_length=50, unique=True, verbose_name="Mã thẻ (Code)")
    serial = models.CharField(max_length=50, unique=True, verbose_name="Số Serial")
    amount = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Mệnh giá")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, verbose_name="Trạng thái")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_cards',
        verbose_name="Người tạo"
    )
    
    used_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='used_cards',
        verbose_name="Người sử dụng"
    )
    used_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian sử dụng")

    class Meta:
        verbose_name = "Thẻ nạp"
        verbose_name_plural = "Danh sách thẻ nạp"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.amount}] {self.code} - {self.status}"
