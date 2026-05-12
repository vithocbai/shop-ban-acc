from apps.notification.models import Notification

def notify_user(user, title: str, content: str, n_type: str = Notification.Type.SYSTEM):
    """
    Service gửi thông báo cho người dùng.
    Dễ dàng mở rộng để gửi thêm Email/SMS/Push trong tương lai.
    """
    return Notification.objects.create(
        user=user,
        title=title,
        content=content,
        type=n_type
    )
