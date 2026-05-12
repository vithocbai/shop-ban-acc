import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.games.models import Game
from apps.accounts.models import Account, AccountImage
from django.utils.text import slugify

User = get_user_model()

class Command(BaseCommand):
    help = 'Nạp dữ liệu mẫu cho hệ thống (Games, Accounts, Users)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('--- Bắt đầu nạp dữ liệu mẫu ---'))

        # 1. Tạo Superuser
        admin_email = 'admin@gamemarket.com'
        if not User.objects.filter(email=admin_email).exists():
            admin = User.objects.create_superuser(
                username='admin',
                email=admin_email,
                password='adminpassword',
                role=User.Role.SUPER_ADMIN
            )
            self.stdout.write(f'Đã tạo Admin: {admin_email}')
        else:
            admin = User.objects.get(email=admin_email)

        # 2. Tạo Games
        games_data = [
            {
                'name': 'Liên Quân Mobile',
                'description': 'Game MOBA phổ biến nhất Việt Nam',
                'theme_color': '#008BFF',
                'is_hot': True,
            },
            {
                'name': 'Ngọc Rồng Online',
                'description': 'Game nhập vai thế giới 7 viên ngọc rồng',
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
            status = 'Tạo mới' if created else 'Đã tồn tại'
            self.stdout.write(f'Game: {game.name} ({status})')

        # 3. Tạo Accounts
        lq_game = games[0] # Liên Quân
        nro_game = games[1] # Ngọc Rồng

        # Tạo mẫu cho Liên Quân
        lq_ranks = ['Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Cao Thủ', 'Thách Đấu']
        for i in range(1, 11):
            title = f'Acc Liên Quân #{random.randint(1000, 9999)} - {random.choice(lq_ranks)}'
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
                account_type='Trắng thông tin',
                account_data={
                    'rank': random.choice(lq_ranks),
                    'skins': random.randint(10, 200),
                    'heroes': random.randint(20, 110),
                    'ngoc': 'Full cấp 3'
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
        
        # Tạo mẫu cho Ngọc Rồng
        nro_servers = ['Vũ Trụ 1', 'Vũ Trụ 2', 'Vũ Trụ 3', 'Vũ Trụ 10']
        for i in range(1, 6):
            title = f'Acc Ngọc Rồng #{random.randint(1000, 9999)} - {random.choice(nro_servers)}'
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
                    'hanh_tinh': random.choice(['Namek', 'Xayda', 'Trái Đất']),
                    'suc_manh': f'{random.randint(1, 50)} tỷ',
                    'de_tu': random.choice([True, False])
                },
                created_by=admin
            )

        self.stdout.write(self.style.SUCCESS(f'--- Đã nạp xong 15 tài khoản mẫu! ---'))
        self.stdout.write(self.style.WARNING(f'Tài khoản Admin: {admin_email} / adminpassword'))
