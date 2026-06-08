import os
from datetime import timedelta
from django.utils import timezone
from django.utils.text import slugify
import random

from apps.news.models import Category, Article
from django.contrib.auth import get_user_model

User = get_user_model()
# Get or create a superuser or the first user
admin = User.objects.filter(is_superuser=True).first()
if not admin:
    admin = User.objects.first()

if not admin:
    print("No user found to assign as author. Please create a superuser first.")
    exit()

# Categories
cat_khuyen_mai, _ = Category.objects.get_or_create(title="Khuyến Mãi", slug="khuyen-mai")
cat_huong_dan, _ = Category.objects.get_or_create(title="Hướng Dẫn", slug="huong-dan")
cat_tin_tuc, _ = Category.objects.get_or_create(title="Tin Tức Game", slug="tin-tuc-game")

categories = [cat_khuyen_mai, cat_huong_dan, cat_tin_tuc]

# Mock data
articles_data = [
    {
        "title": "Ra mắt sự kiện Nạp Thẻ Nhận Vàng - Tặng ngay x2 Kim Cương",
        "category": cat_khuyen_mai,
        "thumbnail": "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Cơ hội nhận ngay x2 lượng kim cương khi nạp thẻ trong 3 ngày cuối tuần. Xem ngay chi tiết sự kiện và tham gia ngay để không bỏ lỡ phần quà hấp dẫn.",
        "content": "<h1>Sự Kiện Nạp Thẻ X2 Kim Cương</h1><p>Xin chào các Game Thủ,</p><p>Từ ngày 15/10 đến hết ngày 18/10, hệ thống sẽ mở sự kiện đặc biệt <strong>nhân đôi giá trị thẻ nạp</strong> cho tất cả các mệnh giá khi nạp qua thẻ cào hoặc chuyển khoản ngân hàng.</p><p>Lưu ý:</p><ul><li>Mỗi tài khoản chỉ được hưởng khuyến mãi 1 lần duy nhất trong ngày.</li><li>Không áp dụng cho nạp qua đại lý trung gian.</li></ul><p>Chúc các bạn chơi game vui vẻ!</p>",
    },
    {
        "title": "Hướng dẫn leo rank Liên Quân Mobile lên Cao Thủ chỉ trong 1 tuần",
        "category": cat_huong_dan,
        "thumbnail": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Những mẹo cực hay giúp bạn leo rank Liên Quân Mobile một cách dễ dàng. Cách cấm chọn, di chuyển, và phối hợp cùng đồng đội để đạt tỉ lệ thắng cao nhất.",
        "content": "<h1>Bí Kíp Leo Rank Mùa Này</h1><p>Leo rank không chỉ dựa vào kỹ năng cá nhân mà còn cần sự phối hợp và chiến thuật.</p><h3>1. Chọn tướng theo Meta</h3><p>Mùa này, các tướng sát thủ đi rừng như Nakroth, Murad đang rất mạnh. Đừng ngại pick ngay nếu đội hình cần sát thương chủ lực.</p><h3>2. Kiểm soát bản đồ</h3><p>Việc check map liên tục giúp bạn tránh bị gank và kiểm soát mục tiêu lớn như Rồng và Tà Thần.</p><blockquote><p>\"Không có vị tướng nào yếu, chỉ có người chơi chưa biết cách phát huy sức mạnh của tướng đó.\"</p></blockquote>",
    },
    {
        "title": "GTA VI chính thức công bố Trailer đầu tiên - Đồ họa siêu thực",
        "category": cat_tin_tuc,
        "thumbnail": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Rockstar Games vừa tung ra đoạn trailer đầu tiên của GTA VI, xác nhận bối cảnh Vice City cùng đồ họa khiến cả thế giới game thủ phải trầm trồ.",
        "content": "<h1>Trailer GTA VI gây bão mạng xã hội</h1><p>Chỉ sau 24 giờ đăng tải, trailer của Grand Theft Auto VI đã thu hút hàng chục triệu lượt xem.</p><p>Bối cảnh được xác nhận là Vice City hiện đại, với nhân vật nữ chính đầu tiên trong lịch sử dòng game. Đồ họa của game vượt qua mọi sự kỳ vọng với hệ thống ánh sáng, đổ bóng và vật lý cực kì chân thực.</p><p>Dự kiến game sẽ ra mắt vào năm 2025 trên các hệ máy PS5 và Xbox Series X/S.</p>",
    },
    {
        "title": "Giảm giá sốc 50% toàn bộ tài khoản VIP nhân dịp Sinh nhật Shop",
        "category": cat_khuyen_mai,
        "thumbnail": "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Mừng sinh nhật 5 tuổi của Shop Game, toàn bộ tài khoản VIP Liên Quân, Free Fire, PUBG Mobile sẽ được giảm giá lên tới 50%. Mua ngay kẻo lỡ!",
        "content": "<h1>Đại tiệc sinh nhật - Giảm giá nửa giá</h1><p>Tri ân khách hàng đã đồng hành cùng Shop Game trong suốt 5 năm qua, chúng tôi xin gửi tới chương trình siêu khuyến mãi cực sốc.</p><p>Toàn bộ tài khoản có gắn mác <strong>VIP</strong> sẽ được tự động giảm giá 50% khi thanh toán.</p><p>Thời gian áp dụng: 20/10 - 25/10. Số lượng có hạn, nhanh tay săn tài khoản xịn giá hời!</p>",
    },
    {
        "title": "Cách tối ưu hóa FPS khi chơi Valorant trên máy cấu hình yếu",
        "category": cat_huong_dan,
        "thumbnail": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Gặp tình trạng giật lag khi chơi Valorant? Dưới đây là các bước tối ưu hóa cài đặt đồ họa và Windows để đạt được mức FPS ổn định nhất.",
        "content": "<h1>Tăng FPS Valorant cực đơn giản</h1><p>Để chơi tốt các tựa game FPS, một khung hình mượt mà là điều vô cùng cần thiết. Dưới đây là các bước bạn cần làm:</p><ol><li>Vào Settings > Video > Tắt V-Sync.</li><li>Chuyển toàn bộ Material Quality, Texture Quality, Detail Quality về Low.</li><li>Bật Multithreaded Rendering (nếu CPU có nhiều lõi).</li><li>Tắt các ứng dụng chạy ngầm trên Windows.</li></ol><p>Chỉ với vài thao tác nhỏ, bạn đã có thể cải thiện từ 20-30 FPS rồi đó!</p>",
    },
    {
        "title": "Cập nhật Tốc Chiến 4.4: Ra mắt tướng mới và làm lại hệ thống trang bị",
        "category": cat_tin_tuc,
        "thumbnail": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Bản cập nhật 4.4 của LMHT: Tốc Chiến mang đến vị tướng pháp sư đường giữa cực mạnh và một loạt thay đổi về hệ thống trang bị phép thuật.",
        "content": "<h1>Patch 4.4 có gì mới?</h1><p>Bản cập nhật lớn nhất trong quý 4 đã chính thức cập bến máy chủ Việt Nam.</p><p>Điểm nhấn lớn nhất là sự xuất hiện của Syndra - Nữ Chúa Bóng Tối. Ngoài ra, hàng loạt trang bị phép thuật như Trượng Pha Lê Rylai, Mũ Phù Thủy đã được điều chỉnh lại chỉ số.</p><p>Hãy đăng nhập và trải nghiệm ngay sự thay đổi meta thú vị này!</p>",
    },
    {
        "title": "Hoàn tiền 10% khi thanh toán qua ví MoMo",
        "category": cat_khuyen_mai,
        "thumbnail": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Tin vui cho anh em game thủ, khi nạp tiền mua tài khoản bằng ví MoMo, bạn sẽ nhận được hoàn tiền ngẫu nhiên lên tới 10% thẳng vào ví.",
        "content": "<h1>Hoàn tiền ví điện tử MoMo</h1><p>Khi quét mã QR thanh toán trên website qua ứng dụng MoMo, bạn sẽ có cơ hội nhận thẻ quà tặng hoặc hoàn tiền mặt.</p><p>Không giới hạn số lần hoàn tiền trong suốt thời gian diễn ra sự kiện. Quá tuyệt vời phải không nào!</p>",
    },
    {
        "title": "Bí kíp nhảy dù PUBG Mobile luôn loot được súng xịn",
        "category": cat_huong_dan,
        "thumbnail": "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Không còn tình cảnh tiếp đất trắng tay. Tìm hiểu ngay quỹ đạo nhảy dù và các vị trí nhảy an toàn nhưng giàu tài nguyên trong map Erangel.",
        "content": "<h1>Hướng dẫn nhảy dù nhanh và chính xác</h1><p>Khoảng cách tối ưu để bắt đầu nhảy dù là 750m - 800m. Hãy cắm thẳng đầu xuống để đạt tốc độ tối đa 234km/h.</p><h3>Các khu vực khuyên dùng:</h3><ul><li><strong>Georgopol:</strong> Nhiều thùng container chứa M416, Kar98k.</li><li><strong>Pochinki:</strong> Trung tâm bản đồ, dễ phòng thủ nhưng giao tranh ác liệt.</li><li><strong>Mylta Power:</strong> Khu nhà xưởng với trang bị cấp 3 cực ngon.</li></ul>",
    },
    {
        "title": "Tựa game Genshin Impact phá vỡ kỉ lục doanh thu trong bản cập nhật mới",
        "category": cat_tin_tuc,
        "thumbnail": "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Banner của nhân vật mới nhất đã giúp Genshin Impact thu về hàng chục triệu đô chỉ trong vài giờ ra mắt, khẳng định vị thế ông hoàng Gacha.",
        "content": "<h1>Doanh thu khủng của Genshin Impact</h1><p>Cộng đồng game thủ quốc tế đang phát cuồng vì bản cập nhật mới nhất tại quốc gia Fontaine.</p><p>Với cốt truyện sâu sắc và cơ chế chiến đấu dưới nước độc đáo, Hoyoverse lại một lần nữa chứng minh được khả năng làm game đỉnh cao của mình. Banner Thủy Thần Furina đã phá vỡ mọi kỉ lục doanh thu trước đó.</p>",
    },
    {
        "title": "Tặng mã Code Tân Thủ VIP cho mọi tài khoản đăng ký mới",
        "category": cat_khuyen_mai,
        "thumbnail": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1000&auto=format&fit=crop",
        "short_description": "Đăng ký tài khoản ngay hôm nay để nhận mã Code chứa 50.000đ trong ví, thẻ đổi tên miễn phí và Avatar khung viền độc quyền.",
        "content": "<h1>Quà tặng Tân thủ</h1><p>Chúng tôi luôn chào đón các thành viên mới. Hãy tạo tài khoản và nhập mã <strong>TANTHU2024</strong> ở phần Đổi Quà để nhận ngay:</p><ul><li>50.000 VNĐ vào số dư tài khoản.</li><li>Khung Avatar VIP.</li><li>Thẻ đổi tên miễn phí.</li></ul><p>Mã code có hiệu lực vĩnh viễn cho đến khi hết ngân sách sự kiện.</p>",
    }
]

for idx, data in enumerate(articles_data):
    slug_base = slugify(data['title'])
    slug = f"{slug_base}-{random.randint(1000, 9999)}"
    
    Article.objects.create(
        title=data['title'],
        slug=slug,
        category=data['category'],
        author=admin,
        thumbnail=data['thumbnail'],
        short_description=data['short_description'],
        content=data['content'],
        status='PUBLISHED',
        is_visible=True,
        published_at=timezone.now() - timedelta(hours=idx * 5),
        priority=random.randint(0, 10),
        view_count=random.randint(100, 5000),
    )

print(f"Successfully generated {len(articles_data)} mock articles.")
