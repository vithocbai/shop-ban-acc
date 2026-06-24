from apps.notification.models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def _push_to_ws(group_name: str, notification: Notification):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
        
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "notification_message",
            "data": {
                "id": notification.id,
                "title": notification.title,
                "content": notification.content,
                "type": notification.type,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat(),
            }
        }
    )

def notify_user(user, title: str, content: str, n_type: str = Notification.Type.SYSTEM):
    """
    Service gửi thông báo cho người dùng.
    """
    notification = Notification.objects.create(
        user=user,
        title=title,
        content=content,
        type=n_type
    )
    
    # Đẩy real-time
    _push_to_ws(f"user_{user.id}", notification)
    
    return notification

def notify_admins(title: str, content: str, n_type: str = Notification.Type.SYSTEM):
    """
    Gửi thông báo đến toàn bộ Admin (is_staff=True).
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    admins = User.objects.filter(is_staff=True)
    notifications = []
    for admin in admins:
        notifications.append(Notification(
            user=admin,
            title=title,
            content=content,
            type=n_type
        ))
    if notifications:
        created_notifications = Notification.objects.bulk_create(notifications)
        # Vì bulk_create không gọi pre_save/post_save và chúng ta đẩy chung nội dung cho admin
        # ta có thể đẩy luôn 1 sự kiện duy nhất lên group "admins" với một bản sao data.
        if created_notifications:
            _push_to_ws("admins", created_notifications[0])
