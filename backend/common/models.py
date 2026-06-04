from django.db import models
from django.utils import timezone

class TimestampedModel(models.Model):
    """
    Model cơ sở để tự động theo dõi thời gian tạo và cập nhật.
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Thời gian cập nhật")

    class Meta:
        abstract = True

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def all_with_deleted(self):
        return super().get_queryset()

class SoftDeleteModel(models.Model):
    """
    Model cơ sở hỗ trợ xóa mềm (Soft delete).
    """
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian xóa")

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self, using=None, keep_parents=False):
        super().delete(using=using, keep_parents=keep_parents)
