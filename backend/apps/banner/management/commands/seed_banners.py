from django.core.management.base import BaseCommand
from apps.banner.models import Banner

class Command(BaseCommand):
    help = 'Seed database with mock banners'

    def handle(self, *args, **options):
        # Delete existing banners
        Banner.objects.all().delete()
        self.stdout.write(self.style.WARNING("Deleted all old banners."))

        banners_data = [
            {
                "title": "Khai Mở Máy Chủ Mới - Tặng Ngay Vip 10",
                "position": "HOME_TOP",
                "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop",
                "link_url": "https://shopacc.vn/khuyen-mai",
                "sort_order": 1,
                "description": "Sự kiện đua top nhận quà khủng lên tới 100 củ.",
            },
            {
                "title": "Giải Đấu Thể Thao Điện Tử Mùa Xuân",
                "position": "HOME_TOP",
                "image_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1920&auto=format&fit=crop",
                "link_url": "https://shopacc.vn/esports",
                "sort_order": 2,
                "description": "Đăng ký tham gia ngay để rinh giải thưởng lớn.",
            },
            {
                "title": "Khuyến Mãi Nạp Thẻ Nhận 200% Giá Trị",
                "position": "HOME_MIDDLE",
                "image_url": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1920&auto=format&fit=crop",
                "link_url": "/nap-tien",
                "sort_order": 3,
                "description": "Chỉ áp dụng trong 3 ngày cuối tuần.",
            },
            {
                "title": "Ra Mắt Tướng Mới: Kẻ Hủy Diệt",
                "position": "HOME_MIDDLE",
                "image_url": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1920&auto=format&fit=crop",
                "link_url": "/tin-tuc/tuong-moi",
                "sort_order": 4,
                "description": "Cập nhật kỹ năng và trang phục đặc quyền.",
            },
            {
                "title": "Sự Kiện Sinh Nhật 5 Tuổi",
                "position": "HOME_BOTTOM",
                "image_url": "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1920&auto=format&fit=crop",
                "link_url": "/su-kien/sinh-nhat",
                "sort_order": 5,
                "description": "Rất nhiều phần quà đang chờ đón.",
            },
            {
                "title": "Cập Nhật Bản Đồ Sinh Tồn",
                "position": "SIDEBAR",
                "image_url": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=800&auto=format&fit=crop",
                "link_url": "/tin-tuc/map-moi",
                "sort_order": 6,
                "description": "Chế độ sinh tồn hoàn toàn mới.",
            },
            {
                "title": "Shop Bán Acc Uy Tín Số 1",
                "position": "SIDEBAR",
                "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
                "link_url": "/",
                "sort_order": 7,
                "description": "Bảo hành trọn đời, hỗ trợ 24/7.",
            },
            {
                "title": "Vòng Quay May Mắn",
                "position": "HOME_BOTTOM",
                "image_url": "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1920&auto=format&fit=crop",
                "link_url": "/vong-quay",
                "sort_order": 8,
                "description": "Cơ hội trúng iPhone 15 Pro Max.",
            },
            {
                "title": "Hướng Dẫn Nạp Thẻ An Toàn",
                "position": "SIDEBAR",
                "image_url": "https://images.unsplash.com/photo-1580234797602-22c37b4a6230?q=80&w=800&auto=format&fit=crop",
                "link_url": "/huong-dan/nap-the",
                "sort_order": 9,
                "description": "Tránh lừa đảo, nạp siêu tốc.",
            },
            {
                "title": "Giao Lưu Cùng Streamer",
                "position": "HOME_TOP",
                "image_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop",
                "link_url": "/su-kien/streamer",
                "sort_order": 10,
                "description": "Nhận ngay code trải nghiệm vip.",
            }
        ]

        for data in banners_data:
            Banner.objects.create(
                title=data['title'],
                position=data['position'],
                image_url=data['image_url'],
                link_url=data.get('link_url', ''),
                sort_order=data['sort_order'],
                description=data.get('description', ''),
                is_active=True,
                show_in_home=True,
                devices=["Desktop", "Tablet", "Mobile"]
            )

        # Tránh lỗi encoding khi in ra console
        success_msg = "Successfully seeded 10 banners!"
        self.stdout.write(self.style.SUCCESS(success_msg))
