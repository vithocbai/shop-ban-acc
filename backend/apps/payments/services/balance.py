import uuid
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.payments.models import Transaction

@transaction.atomic
def update_user_balance(user, amount: Decimal, transaction_type: str, note: str = "", metadata: dict = None):
    """
    Cập nhật số dư người dùng và ghi lại giao dịch.
    - amount: Có thể âm (trừ tiền) hoặc dương (cộng tiền).
    - transaction_type: Loại giao dịch (DEPOSIT, PURCHASE, v.v.).
    """
    # Khóa dòng user để tránh tranh chấp (race condition)
    user_to_update = user.__class__.objects.select_for_update().get(pk=user.pk)
    
    balance_before = user_to_update.balance
    user_to_update.balance += amount
    user_to_update.save()
    balance_after = user_to_update.balance
    
    # Tạo bản ghi giao dịch
    transaction_log = Transaction.objects.create(
        user=user_to_update,
        transaction_code=f"TRX{uuid.uuid4().hex[:10].upper()}",
        type=transaction_type,
        amount=abs(amount),
        balance_before=balance_before,
        balance_after=balance_after,
        note=note,
        metadata=metadata or {},
        status=Transaction.Status.SUCCESS
    )
    
    return transaction_log, user_to_update
