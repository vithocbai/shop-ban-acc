import uuid
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from apps.account.models import Account
from apps.payment.models import Transaction
from apps.payment.services.balance import update_user_balance
from apps.order.models import Order, OrderItem
from apps.notification.services.notifier import notify_user
from apps.notification.models import Notification

@transaction.atomic
def purchase_account(user, account_id: int, note: str = ""):
    """
    Quy trình mua tài khoản game:
    1. Kiểm tra tài khoản có sẵn để bán không.
    2. Kiểm tra số dư người dùng.
    3. Trừ tiền người dùng và ghi log giao dịch.
    4. Cập nhật trạng thái tài khoản thành SOLD.
    5. Tạo đơn hàng và chi tiết đơn hàng.
    """
    
    # 1. Lấy tài khoản và khóa để tránh tranh chấp
    try:
        account = Account.objects.select_for_update().get(pk=account_id, deleted_at__isnull=True)
    except Account.DoesNotExist:
        raise ValidationError("Tài khoản không tồn tại.")

    if account.status != Account.Status.AVAILABLE:
        raise ValidationError("Tài khoản này đã được bán hoặc không còn sẵn dụng.")

    # 2. Kiểm tra số dư
    if user.balance < account.price:
        raise ValidationError("Số dư không đủ để thực hiện giao dịch này. Vui lòng nạp thêm tiền.")

    # 3. Trừ tiền người dùng (Sử dụng service đã viết ở module Payment)
    transaction_log, updated_user = update_user_balance(
        user=user,
        amount=-account.price, # Số tiền âm để trừ tiền
        transaction_type=Transaction.Type.PURCHASE,
        note=f"Mua tài khoản #{account.account_code}",
        metadata={"account_id": account.id}
    )

    # 4. Cập nhật trạng thái tài khoản
    account.status = Account.Status.SOLD
    account.sold_at = timezone.now()
    account.save()

    # 5. Tạo đơn hàng
    order = Order.objects.create(
        user=user,
        order_code=f"ORD{uuid.uuid4().hex[:10].upper()}",
        total_price=account.price,
        payment_status=Order.PaymentStatus.PAID,
        delivery_status=Order.DeliveryStatus.DELIVERED,
        note=note
    )

    # 6. Tạo chi tiết đơn hàng (Bàn giao dữ liệu)
    OrderItem.objects.create(
        order=order,
        account=account,
        price=account.price,
        delivery_data={
            "account_code": account.account_code,
            "login_type": account.login_type,
            "message": "Vui lòng liên hệ Admin để nhận thông tin đăng nhập chi tiết."
        }
    )

    # 7. Gửi thông báo cho người mua
    notify_user(
        user=user,
        title="Mua tài khoản thành công",
        content=f"Chúc mừng! Bạn đã sở hữu tài khoản {account.account_code}. Kiểm tra lịch sử đơn hàng để xem thông tin.",
        n_type=Notification.Type.ORDER
    )

    # 8. Gửi thông báo cho Admin
    from apps.notification.services.notifier import notify_admins
    notify_admins(
        title="Tài khoản vừa được bán",
        content=f"User {user.username} vừa mua tài khoản {account.account_code} với giá {account.price:,.0f}đ.",
        n_type=Notification.Type.ORDER
    )

    return order
