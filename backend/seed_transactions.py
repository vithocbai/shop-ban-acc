import os
import django
import random
import uuid
from decimal import Decimal
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from django.contrib.auth import get_user_model
from apps.payment.models import Transaction
from django.utils import timezone

User = get_user_model()
users = list(User.objects.all())

if not users:
    print("No users found to create transactions. Create users first!")
else:
    print("Creating mock transactions...")
    
    types = [
        Transaction.Type.DEPOSIT,
        Transaction.Type.DEPOSIT,
        Transaction.Type.DEPOSIT,
        Transaction.Type.PURCHASE,
        Transaction.Type.REFUND,
        Transaction.Type.WITHDRAW
    ]
    
    statuses = [
        Transaction.Status.SUCCESS,
        Transaction.Status.SUCCESS,
        Transaction.Status.SUCCESS,
        Transaction.Status.PENDING,
        Transaction.Status.FAILED,
        Transaction.Status.CANCELLED
    ]
    
    methods = ['BANK_TRANSFER', 'MOMO', 'CARD']
    
    transactions_to_create = []
    
    # Tao khoang 50 transactions random
    for i in range(50):
        user = random.choice(users)
        trans_type = random.choice(types)
        status = random.choice(statuses)
        amount = Decimal(random.choice([20000, 50000, 100000, 200000, 500000, 1000000]))
        
        # Gia lap so du truoc va sau giao dich
        balance_before = Decimal(random.randint(0, 1000000))
        if status == Transaction.Status.SUCCESS:
            if trans_type in [Transaction.Type.DEPOSIT, Transaction.Type.REFUND]:
                balance_after = balance_before + amount
            else:
                balance_after = max(Decimal(0), balance_before - amount)
        else:
            balance_after = balance_before
            
        method = random.choice(methods) if trans_type == Transaction.Type.DEPOSIT else None
        
        # Generate some random dates in the last 30 days
        created_at = timezone.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        
        trans = Transaction(
            user=user,
            transaction_code=f"TRX_{uuid.uuid4().hex[:8].upper()}",
            type=trans_type,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            payment_method=method,
            status=status,
            note=f"Mock transaction {i}",
        )
        # We cannot set created_at directly in bulk_create if auto_now_add is True, 
        # so we'll save them individually to override it if needed, or just let it be now.
        # But to simulate history, we save them normally and update created_at later
        transactions_to_create.append(trans)
        
    created_trans = Transaction.objects.bulk_create(transactions_to_create)
    
    # Update created_at
    for idx, trans in enumerate(created_trans):
        random_date = timezone.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        Transaction.objects.filter(pk=trans.pk).update(created_at=random_date)
        
    print(f"Done! Created {len(created_trans)} mock transactions.")
