from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from common.models import TimestampedModel, SoftDeleteModel

class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        # Tự động gán role SUPER_ADMIN khi chạy lệnh createsuperuser
        extra_fields.setdefault("role", "SUPER_ADMIN")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(username, email, password, **extra_fields)

    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def all_with_deleted(self):
        return super().get_queryset()

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

    objects = CustomUserManager()

    class Meta:
        verbose_name = "Người dùng"
        verbose_name_plural = "Danh sách người dùng"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    def delete(self, using=None, keep_parents=False):
        import uuid
        # Append a short uuid to email and username to avoid unique constraint issues
        suffix = f"_del_{uuid.uuid4().hex[:6]}"
        
        # Format email: abc@gmail.com -> abc_del_xxxxxx@gmail.com
        if '@' in self.email:
            parts = self.email.split('@')
            self.email = f"{parts[0][:40]}{suffix}@{parts[1]}"
        else:
            self.email = f"{self.email[:40]}{suffix}"
            
        self.username = f"{self.username[:40]}{suffix}"
        
        # Dùng save thay vì update để không dính hook update_fields nếu không cẩn thận
        self.save(update_fields=['email', 'username'])
        super().delete(using=using, keep_parents=keep_parents)
