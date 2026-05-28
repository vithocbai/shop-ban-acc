import random
import uuid
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.account.models import Account
from apps.order.models import Order, OrderItem

User = get_user_model()

class Command(BaseCommand):
    help = 'Tạo dữ liệu mock cho Order và OrderItem'

    def handle(self, *args, **kwargs):
        users = list(User.objects.all())
        if not users:
            self.stdout.write(self.style.ERROR('Cần tạo ít nhất 1 User trước khi seed đơn hàng!'))
            return
        
        accounts = list(Account.objects.filter(status='AVAILABLE'))
        if not accounts:
            self.stdout.write(self.style.ERROR('Cần có tài khoản (Account) ở trạng thái AVAILABLE để tạo đơn hàng mock!'))
            return

        orders_created = 0

        # Tạo 15 đơn hàng mock
        for i in range(15):
            buyer = random.choice(users)
            num_items = random.randint(1, 3)
            
            # Chọn các tài khoản có sẵn
            selected_accounts = random.sample(accounts, min(num_items, len(accounts)))
            if not selected_accounts:
                continue

            total_price = sum(acc.price for acc in selected_accounts)
            
            payment_status = random.choice(['PENDING', 'PAID', 'PAID', 'PAID', 'FAILED', 'REFUNDED'])
            delivery_status = 'PENDING'
            if payment_status == 'PAID':
                delivery_status = random.choice(['PENDING', 'DELIVERED', 'DELIVERED', 'FAILED'])
            
            # Tạo Order
            order = Order.objects.create(
                user=buyer,
                order_code=f"ORD{uuid.uuid4().hex[:6].upper()}",
                total_price=total_price,
                payment_status=payment_status,
                delivery_status=delivery_status,
                note=f"Đơn hàng mock {i+1}"
            )
            
            # Tạo OrderItems
            for acc in selected_accounts:
                delivery_data = {}
                if delivery_status == 'DELIVERED':
                    delivery_data = {
                        "username_game": f"buyer_{random.randint(100, 999)}",
                        "password_game": "secretpass123",
                        "email_game": f"{buyer.username}_game@gmail.com",
                        "note": "Nhớ đổi pass ngay khi đăng nhập"
                    }
                
                OrderItem.objects.create(
                    order=order,
                    account=acc,
                    price=acc.price,
                    delivery_data=delivery_data
                )
                
                # Sau khi bị mua thì đổi trạng thái sang SOLD
                acc.status = 'SOLD'
                acc.save()

            # Fix created_at time to spread out over last 30 days
            order.created_at = timezone.now() - timezone.timedelta(days=random.randint(0, 30), hours=random.randint(1, 23))
            order.save()

            orders_created += 1

            # Remove sold accounts from the available pool
            for acc in selected_accounts:
                if acc in accounts:
                    accounts.remove(acc)

        self.stdout.write(self.style.SUCCESS(f'Tạo thành công {orders_created} đơn hàng mock!'))
