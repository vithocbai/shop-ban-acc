from django.contrib.auth.models import AbstractUser
from django.db import models
from common.models import TimestampedModel, SoftDeleteModel

class User(AbstractUser, TimestampedModel, SoftDeleteModel):
    """
    Custom User Model theo yêu cầu trong DATA-SCHEMA.md.
    Hỗ trợ số dư tài khoản (balance), phân quyền (role) và trạng thái (status).
    """
    
    class Role(models.TextChoices):
        USER = 'USER', 'Người dùng'
        ADMIN = 'ADMIN', 'Quản trị viên'
        SUPER_ADMIN = 'SUPER_ADMIN', 'Siêu quản trị'
        MODERATOR = 'MODERATOR', 'Điều phối viên'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Đang hoạt động'
        BANNED = 'BANNED', 'Đã bị khóa'
        PENDING = 'PENDING', 'Chờ xác thực'

    email = models.EmailField(unique=True, verbose_name="Địa chỉ email")
    avatar = models.TextField(null=True, blank=True, verbose_name="Ảnh đại diện")
    phone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Số điện thoại")
    balance = models.DecimalField(max_digits=18, decimal_places=2, default=0, verbose_name="Số dư")
    role = models.CharField(
        max_length=30, 
        choices=Role.choices, 
        default=Role.USER,
        verbose_name="Vai trò"
    )
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.ACTIVE,
        verbose_name="Trạng thái"
    )
    email_verified = models.BooleanField(default=False, verbose_name="Đã xác thực email")

    # Sử dụng email để đăng nhập thay vì username
    REQUIRED_FIELDS = ['username']
    USERNAME_FIELD = 'email'

    class Meta:
        verbose_name = "Người dùng"
        verbose_name_plural = "Danh sách người dùng"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
