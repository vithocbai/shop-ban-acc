import uuid
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from apps.accounts.models import Account
from apps.payments.models import Transaction
from apps.payments.services.balance import update_user_balance
from apps.orders.models import Order, OrderItem

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

    return order
