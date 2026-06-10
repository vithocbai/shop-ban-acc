from django.core.management.base import BaseCommand
from datetime import timedelta
from django.utils import timezone
from django.utils.text import slugify
import random

from apps.news.models import Category, Article
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Seed database with mock news articles'

    def handle(self, *args, **options):
        User = get_user_model()
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            admin = User.objects.first()

        if not admin:
            self.stdout.write(self.style.ERROR("No user found to assign as author."))
            return

        cat_khuyen_mai, _ = Category.objects.get_or_create(slug="khuyen-mai", defaults={"title": "Khuyến Mãi"})
        cat_huong_dan, _ = Category.objects.get_or_create(slug="huong-dan", defaults={"title": "Hướng Dẫn"})
        cat_tin_tuc, _ = Category.objects.get_or_create(slug="tin-tuc-game", defaults={"title": "Tin Tức Game"})

        # Xoá toàn bộ bài viết cũ để reset
        Article.objects.all().delete()
        self.stdout.write(self.style.WARNING("Deleted all old articles."))

        articles_data = [
            {
                "title": "Bản Cập Nhật Lớn Nhất Mùa 13: Thay Đổi Toàn Diện Về Meta Game",
                "category": cat_tin_tuc,
                "thumbnail": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
                "short_description": "Mùa 13 chính thức khởi tranh với hàng loạt thay đổi về sức mạnh tướng, trang bị và bản đồ. Khám phá ngay những điểm nhấn quan trọng nhất.",
                "content": """
                <h1>Tổng Quan Bản Cập Nhật Mùa 13</h1>
                <p>Xin chào các game thủ, <strong>Mùa 13</strong> đã chính thức hạ cánh mang theo hàng loạt sự thay đổi làm chao đảo meta hiện tại. Từ việc tăng sức mạnh cho các pháp sư đường giữa đến việc chỉnh sửa lại hệ thống rừng, mọi thứ đang trở nên kịch tính hơn bao giờ hết.</p>
                
                <p><img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop" alt="Game update" style="width: 100%; border-radius: 8px; margin: 20px 0;" /></p>
                
                <h3>1. Rừng Trở Thành Điểm Nóng</h3>
                <p>Quái rừng giờ đây cung cấp nhiều kinh nghiệm hơn nhưng cũng máu trâu hơn. Việc kiểm soát rừng không còn dễ dàng, đòi hỏi người chơi đi rừng phải tính toán thời gian kỹ lưỡng.</p>
                
                <blockquote>"Chúng tôi muốn mỗi quyết định di chuyển vào rừng đều mang lại rủi ro tương xứng với phần thưởng." - Đội ngũ phát triển</blockquote>
                
                <h3>2. Trang Bị Mới: Khiên Vệ Thần</h3>
                <ul>
                    <li><strong>Giá:</strong> 3100 vàng</li>
                    <li><strong>Chỉ số:</strong> +500 Máu, +60 Giáp, +10% Giảm hồi chiêu</li>
                    <li><strong>Nội tại duy nhất:</strong> Khi nhận sát thương chí mạng, tạo một lớp giáp hấp thụ 15% máu tối đa.</li>
                </ul>
                <p>Với trang bị này, các tướng Đỡ đòn sẽ có thêm một lựa chọn tuyệt vời để đối đầu với các Xạ thủ chí mạng ở cuối trận.</p>
                """,
            },
            {
                "title": "Hướng Dẫn Build Đội Hình Leo Thách Đấu - Cờ Liên Quân",
                "category": cat_huong_dan,
                "thumbnail": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop",
                "short_description": "Bí kíp leo rank Thách Đấu với đội hình Cung Thủ - Sát Thủ đang làm mưa làm gió trên bảng xếp hạng Cờ Liên Quân mùa này.",
                "content": """
                <h1>Chiến Thuật Cờ Liên Quân Mùa Mới</h1>
                <p>Cờ Liên Quân đang chứng kiến sự trỗi dậy mạnh mẽ của đội hình <strong>Cung Thủ - Sát Thủ</strong>. Với khả năng sốc sát thương ở tuyến sau cực nhanh, đội hình này gần như không có đối thủ nếu được "bơm" đồ chuẩn.</p>
                
                <p><img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop" alt="Chess tactics" style="width: 100%; border-radius: 8px; margin: 20px 0;" /></p>
                
                <h3>Cách Xây Dựng Đội Hình</h3>
                <ol>
                    <li><strong>Giai đoạn đầu trận (Vòng 1-10):</strong> Tập trung gom các quân cờ giá rẻ như Valhein, Tel'Annas. Đừng vội nâng cấp cấp độ nếu bạn chưa có chuỗi thắng.</li>
                    <li><strong>Giai đoạn giữa trận (Vòng 11-20):</strong> Bắt đầu tìm kiếm Quillen và Nakroth. Đây là lúc sát thương tuyến sau bắt đầu phát huy tác dụng. Ghép đồ tăng công vật lý cho Cung Thủ chính.</li>
                    <li><strong>Giai đoạn cuối trận (Vòng 21+):</strong> Hoàn thiện đội hình 6 Cung Thủ - 3 Sát Thủ. Đặt các quân cờ chống chịu (Tanker) ở hàng đầu để thu hút hỏa lực.</li>
                </ol>
                
                <h3>Trang Bị Khuyên Dùng</h3>
                <p>Nên ưu tiên <em>Kiếm Fafnir</em> và <em>Vuốt Hung Tàn</em> cho chủ lực. Tốc độ đánh là chìa khóa chiến thắng.</p>
                """,
            },
            {
                "title": "Sự Kiện Sinh Nhật 5 Tuổi: Nhận Trang Phục Huyền Thoại Miễn Phí",
                "category": cat_khuyen_mai,
                "thumbnail": "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop",
                "short_description": "Chào mừng sinh nhật 5 tuổi của game! Đăng nhập tích lũy để nhận ngay Rương Trang Phục Huyền Thoại và hàng ngàn quà tặng khác.",
                "content": """
                <h1 style="text-align: center;">ĐẠI TIỆC SINH NHẬT - QUÀ NGẬP TRÀN</h1>
                <p>Tháng 10 này, chúng ta cùng chào đón sinh nhật 5 tuổi với chuỗi sự kiện lớn nhất từ trước đến nay!</p>
                
                <p><img src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1000&auto=format&fit=crop" alt="Birthday event" style="width: 100%; border-radius: 8px; margin: 20px 0;" /></p>
                
                <h3>🎁 Quà Tặng Đăng Nhập</h3>
                <p>Chỉ cần đăng nhập liên tục trong 7 ngày, bạn sẽ nhận được:</p>
                <ul class="task-list">
                    <li><input type="checkbox" disabled checked> Ngày 1-3: Nhận 500 Vàng và Thẻ X2 EXP</li>
                    <li><input type="checkbox" disabled checked> Ngày 4-6: Nhận Vé Quay Kho Báu và Thẻ Đổi Tên</li>
                    <li><input type="checkbox" disabled> <strong>Ngày 7: Rương Trang Phục Huyền Thoại (Chọn 1 trong 5)</strong></li>
                </ul>
                
                <h3>🔥 Sự Kiện Khuyến Mãi Nạp Thẻ</h3>
                <p>Đặc biệt, trong 3 ngày cuối tuần (20/10 - 22/10), mọi giao dịch nạp thẻ qua hệ thống sẽ được <strong>nhân đôi giá trị Kim Cương</strong>. Cơ hội hiếm có để sở hữu lượng tài nguyên khổng lồ với chi phí tiết kiệm nhất.</p>
                <p><em>Hãy lan tỏa tin vui này đến bạn bè và cùng tham gia đại tiệc nhé!</em></p>
                """,
            },
            {
                "title": "Top 5 Sai Lầm Tân Thủ Thường Mắc Phải Khi Chơi FPS",
                "category": cat_huong_dan,
                "thumbnail": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
                "short_description": "Những lỗi cơ bản khiến bạn thường xuyên 'nằm sấp' trong các tựa game bắn súng góc nhìn thứ nhất (FPS) và cách khắc phục.",
                "content": """
                <h1>Khắc Phục 5 Sai Lầm Chí Mạng Trong Game FPS</h1>
                <p>Bước vào thế giới của các tựa game FPS như Valorant, CS2 hay PUBG, rất nhiều tân thủ gặp khó khăn trong việc sinh tồn và ghi mạng. Hãy xem bạn có đang mắc phải những sai lầm này không nhé!</p>
                
                <p><img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop" alt="FPS Gaming" style="width: 100%; border-radius: 8px; margin: 20px 0;" /></p>
                
                <h3>1. Chạy Quá Nhiều (Lộ Tiếng Bước Chân)</h3>
                <p>Tiếng bước chân là thông tin quan trọng nhất trong game FPS. Việc bạn chạy bộ liên tục (Sprint) sẽ đánh động kẻ thù từ xa. <strong>Cách khắc phục:</strong> Sử dụng phím đi bộ (Walk) hoặc ngồi (Crouch) khi tiếp cận các góc khuất.</p>
                
                <h3>2. Để Tâm Ngắm Quá Thấp (Crosshair Placement)</h3>
                <p>Tân thủ thường có thói quen chĩa súng xuống đất. Khi bất ngờ gặp địch, bạn sẽ mất thêm thời gian để vẩy chuột lên. <strong>Quy tắc vàng:</strong> Luôn giữ tâm ngắm ở tầm ngang đầu (Head-level) ở mọi thời điểm.</p>
                
                <h3>3. Reload Súng Không Đúng Lúc</h3>
                <p>Vừa bắn 2 viên đã vội thay đạn? Đó là lúc kẻ địch thứ hai sẽ hạ gục bạn trong khi bạn đang kẹt trong animation nạp đạn. Hãy tập thói quen chỉ thay đạn khi đã an toàn tuyệt đối hoặc băng đạn thực sự cạn kiệt.</p>
                """,
            },
            {
                "title": "Review Game: Đồ Họa Đỉnh Cao, Cốt Truyện Gây Tranh Cãi",
                "category": cat_tin_tuc,
                "thumbnail": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=1000&auto=format&fit=crop",
                "short_description": "Tựa game AAA được mong chờ nhất năm nay cuối cùng cũng ra mắt. Tuy nhiên, đằng sau lớp áo đồ họa hào nhoáng là một cốt truyện chia rẽ cộng đồng.",
                "content": """
                <h1>Đánh Giá Trực Tiếp Siêu Phẩm AAA Mới Nhất</h1>
                <p>Sau hơn 5 năm phát triển với kinh phí hàng trăm triệu USD, siêu phẩm nhập vai thế giới mở cuối cùng cũng trình làng. Chúng tôi đã có hơn 50 giờ trải nghiệm và đây là bài đánh giá chi tiết.</p>
                
                <p><img src="https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1000&auto=format&fit=crop" alt="Gameplay" style="width: 100%; border-radius: 8px; margin: 20px 0;" /></p>
                
                <h3>Đồ Họa: Chuẩn Mực Mới (10/10)</h3>
                <p>Không có gì để chê trách về mặt hình ảnh. Hệ thống thời tiết động, công nghệ Ray Tracing và mô phỏng vật lý cực kì chân thực khiến từng góc phố, từng giọt mưa đều sống động.</p>
                
                <h3>Gameplay: Đa Dạng Nhưng Lặp Lại (8/10)</h3>
                <p>Hệ thống chiến đấu rất thỏa mãn với cơ chế phản đòn (Parry) điêu luyện. Tuy nhiên, các nhiệm vụ phụ bắt đầu trở nên nhàm chán sau khoảng 20 giờ chơi đầu tiên.</p>
                
                <h3>Cốt Truyện: Đỉnh Điểm Tranh Cãi (6/10)</h3>
                <p>Phần kết của game đang tạo ra một làn sóng phẫn nộ trên các diễn đàn. Việc "kill off" (khai tử) nhân vật được yêu thích nhất từ phần trước một cách lãng xẹt khiến nhiều fan cứng cảm thấy bị phản bội.</p>
                <hr />
                <p><strong>Tổng kết:</strong> Một trải nghiệm thị giác tuyệt vời, nhưng chưa đủ để trở thành một "Masterpiece" hoàn hảo.</p>
                """,
            }
        ]

        # Sinh thêm 5 bài nữa cho đủ 10 bài bằng cách lặp lại với tiêu đề khác
        extra_articles = []
        for i in range(5):
            base_art = articles_data[i].copy()
            base_art["title"] = f"[Mới] {base_art['title']} - Phần {i+2}"
            base_art["view_count"] = random.randint(1000, 20000)
            extra_articles.append(base_art)
            
        articles_data.extend(extra_articles)

        count = 0
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
                published_at=timezone.now() - timedelta(hours=idx * 2),
                priority=random.randint(0, 10),
                view_count=data.get('view_count', random.randint(100, 5000)),
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully generated {count} xịn sò mock articles."))
