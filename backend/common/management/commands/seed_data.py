import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.game.models import Game
from apps.account.models import Account, AccountImage
from django.utils.text import slugify

User = get_user_model()

class Command(BaseCommand):
    help = 'Nap du lieu mau cho he thong (Games, Accounts, Users)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('--- Bat dau nap du lieu mau ---'))

        # 1. Tạo Superuser
        admin_email = 'admin@gamemarket.com'
        if not User.objects.filter(email=admin_email).exists():
            admin = User.objects.create_superuser(
                username='admin',
                email=admin_email,
                password='admin123',
                role=User.Role.SUPER_ADMIN
            )
            self.stdout.write(f'OK: Tao Admin: {admin_email} / admin123')
        else:
            admin = User.objects.get(email=admin_email)

        # 2. Tạo Games
        games_data = [
            {
                'name': 'Lien Quan Mobile',
                'description': 'Game MOBA pho bien nhat Viet Nam',
                'theme_color': '#008BFF',
                'is_hot': True,
            },
            {
                'name': 'Ngoc Rong Online',
                'description': 'Game nhap vai the gioi 7 vien ngoc rong',
                'theme_color': '#FF8C00',
                'is_hot': True,
            }
        ]

        games = []
        for gd in games_data:
            game, created = Game.objects.get_or_create(
                name=gd['name'],
                defaults=gd
            )
            games.append(game)
            status = 'Tao moi' if created else 'Da ton tai'
            self.stdout.write(f'Game: {game.name} ({status})')

        # 3. Tạo Accounts
        lq_game = games[0] # Liên Quân
        nro_game = games[1] # Ngọc Rồng

        # Tạo mẫu cho Liên Quân
        lq_ranks = ['Dong', 'Bac', 'Vang', 'Bach Kim', 'Kim Cuong', 'Cao Thu', 'Thach Dau']
        for i in range(1, 11):
            title = f'Acc Lien Quan #{random.randint(1000, 9999)} - {random.choice(lq_ranks)}'
            price = random.choice([50000, 100000, 200000, 500000, 1000000])
            
            acc = Account.objects.create(
                game=lq_game,
                title=title,
                account_code=f'LQ{1000 + i}',
                thumbnail=f'https://picsum.photos/seed/lq{i}/400/250',
                price=price,
                original_price=price * 1.2,
                discount_percent=20,
                status=Account.Status.AVAILABLE,
                login_type='Garena',
                account_type='Trang thong tin',
                account_data={
                    'rank': random.choice(lq_ranks),
                    'skins': random.randint(10, 200),
                    'heroes': random.randint(20, 110),
                    'ngoc': 'Full cap 3'
                },
                created_by=admin
            )
            
            # Thêm ảnh gallery
            for j in range(3):
                AccountImage.objects.create(
                    account=acc,
                    image_url=f'https://picsum.photos/seed/lqimg{i}{j}/800/500',
                    sort_order=j
                )
            self.stdout.write(f"OK: Tao Account {acc.account_code}")
        
        # Tạo mẫu cho Ngọc Rồng
        nro_servers = ['Vu Tru 1', 'Vu Tru 2', 'Vu Tru 3', 'Vu Tru 10']
        for i in range(1, 6):
            title = f'Acc Ngoc Rong #{random.randint(1000, 9999)} - {random.choice(nro_servers)}'
            price = random.choice([20000, 50000, 150000, 300000])
            
            acc = Account.objects.create(
                game=nro_game,
                title=title,
                account_code=f'NRO{1000 + i}',
                thumbnail=f'https://picsum.photos/seed/nro{i}/400/250',
                price=price,
                status=Account.Status.AVAILABLE,
                login_type='Email',
                account_data={
                    'server': random.choice(nro_servers),
                    'hanh_tinh': random.choice(['Namek', 'Xayda', 'Trai Dat']),
                    'suc_manh': f'{random.randint(1, 50)} ty',
                    'de_tu': random.choice([True, False])
                },
                created_by=admin
            )
            self.stdout.write(f"OK: Tao Account {acc.account_code}")

        self.stdout.write(self.style.SUCCESS(f'--- Da nap xong 15 tai khoan mau! ---'))
        self.stdout.write(self.style.WARNING(f'Tai khoan Admin: {admin_email} / admin123'))
