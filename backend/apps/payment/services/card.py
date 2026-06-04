import uuid
import secrets
from django.db import transaction
from django.utils import timezone
from apps.payment.models import Card, Transaction

def generate_random_code(prefix=""):
    """Sinh chuỗi ngẫu nhiên 12 ký tự"""
    return f"{prefix}{secrets.token_hex(6).upper()}"

def generate_random_serial():
    """Sinh serial ngẫu nhiên 16 ký tự"""
    return f"SERI{secrets.token_hex(8).upper()}"

def generate_cards(quantity: int, amount, admin_user):
    """
    Sinh hàng loạt thẻ cào/voucher.
    """
    cards = []
    prefix = ""
    if amount >= 500000:
        prefix = "VIP"
        
    for _ in range(quantity):
        code = generate_random_code(prefix=prefix)
        serial = generate_random_serial()
        
        cards.append(
            Card(
                code=code,
                serial=serial,
                amount=amount,
                status=Card.Status.ACTIVE,
                created_by=admin_user
            )
        )
        
    # Bulk create cho hiệu suất tốt nhất
    created_cards = Card.objects.bulk_create(cards)
    return created_cards

def redeem_card(user, code: str, serial: str):
    """
    Xử lý người dùng nạp thẻ.
    Đảm bảo Atomic transaction để tránh lỗi race condition.
    """
    with transaction.atomic():
        try:
            # select_for_update để khóa row, ngăn chặn Double Spend
            card = Card.objects.select_for_update().get(
                code=code, 
                serial=serial, 
                status=Card.Status.ACTIVE
            )
        except Card.DoesNotExist:
            raise ValueError("Mã thẻ hoặc số serial không hợp lệ, hoặc thẻ đã được sử dụng.")
            
        # 1. Cập nhật trạng thái thẻ
        card.status = Card.Status.USED
        card.used_by = user
        card.used_at = timezone.now()
        card.save()
        
        # 2. Cập nhật Balance của User
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user_obj = User.objects.select_for_update().get(id=user.id)
        
        balance_before = user_obj.balance
        user_obj.balance += card.amount
        user_obj.save()
        
        # 3. Ghi log Transaction
        Transaction.objects.create(
            user=user_obj,
            transaction_code=f"CARD_{uuid.uuid4().hex[:8].upper()}",
            type=Transaction.Type.DEPOSIT,
            amount=card.amount,
            balance_before=balance_before,
            balance_after=user_obj.balance,
            status=Transaction.Status.SUCCESS,
            payment_method='CARD',
            note=f"Nạp thẻ cào: {serial}"
        )
        
        return card
