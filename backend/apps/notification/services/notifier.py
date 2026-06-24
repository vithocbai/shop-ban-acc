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

def notify_admins(title: str, content: str, n_type: str = Notification.Type.SYSTEM):
    """
    Gửi thông báo đến toàn bộ Admin (is_staff=True).
    Dùng khi có người nạp tiền, mua acc...
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
        Notification.objects.bulk_create(notifications)

