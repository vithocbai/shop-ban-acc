from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer hiển thị thông báo.
    """
    class Meta:
        model = Notification
        fields = ['id', 'title', 'content', 'type', 'is_read', 'created_at']
        read_only_fields = ['id', 'title', 'content', 'type', 'created_at']
