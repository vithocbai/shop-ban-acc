# 🛠 Lộ Trình Phát Triển Backend - Game Account Marketplace

Tài liệu này tổng hợp danh sách các công việc Backend, được sắp xếp theo thứ tự ưu tiên triển khai.

## 🏁 Trạng Thái Tổng Quan
- [x] **Giai đoạn 1**: Khởi tạo & Cấu trúc (100%)
- [x] **Giai đoạn 2**: Core Modules - Users, Games, Accounts (100%)
- [x] **Giai đoạn 3**: Giao dịch & Đơn hàng (100%)
- [ ] **Giai đoạn 4**: Bảo mật & Xác thực nâng cao (20%)
- [ ] **Giai đoạn 5**: Hệ thống bổ trợ & Tối ưu (0%)

---

## 1. Khởi tạo & Nền tảng (Common)
- [x] Thiết lập cấu trúc Monorepo và Django Project.
- [x] Cấu hình môi trường (`.env`, `base/dev/prod settings`).
- [x] Triển khai Base Models (`TimestampedModel`, `SoftDeleteModel`).
- [x] Tích hợp Swagger/Redoc để tự động làm tài liệu API.
- [x] Viết Script Seed Data (Dữ liệu mẫu cho Games, Accounts, Admin).

## 2. Người dùng & Phân quyền (Users)
- [x] Triển khai Custom User Model (Email làm định danh, Balance, Role, Status).
- [x] API Đăng ký / Đăng nhập (JWT Authentication).
- [x] API Quên mật khẩu / Đổi mật khẩu.
- [x] Cập nhật Profile (Avatar, Số điện thoại).
- [ ] Tích hợp Đăng nhập MXH (Google, Facebook) - *Optional*.

## 3. Danh mục Game (Games)
- [x] Model Game (Slug, Icon, Theme color).
- [x] API Public: Xem danh sách Game đang hoạt động.
- [x] API Admin: CRUD danh mục Game.

## 4. Quản lý Tài khoản (Accounts)
- [x] Model Account (Sử dụng JSONB cho dữ liệu động: Rank, Skin...).
- [x] Model AccountImage (Gallery ảnh chi tiết).
- [x] API Public: Danh sách tài khoản kèm bộ lọc nâng cao (Filter theo game, giá, thuộc tính).
- [x] API Public: Xem chi tiết tài khoản.
- [x] API Admin: Đăng bán tài khoản, cập nhật trạng thái.

## 5. Thanh toán & Số dư (Payments)
- [x] Model Transaction: Ghi log biến động số dư (Trước/Sau giao dịch).
- [x] Service `update_user_balance`: Xử lý cộng/trừ tiền an toàn (Atomic).
- [x] Model Deposit: Quản lý yêu cầu nạp tiền (Bank, Momo, Thẻ cào).
- [x] API Admin: Duyệt/Từ chối nạp tiền và tự động cộng số dư.
- [x] API User: Xem lịch sử nạp tiền & biến động số dư.

## 6. Hệ thống Đơn hàng (Orders)
- [x] Model Order & OrderItem.
- [x] Service `purchase_account`: Logic mua hàng (Kiểm tra hàng -> Trừ tiền -> Chốt đơn -> Bàn giao).
- [x] API Checkout: Người dùng thực hiện mua tài khoản.
- [x] API Order History: Xem lịch sử mua và nhận thông tin tài khoản đã mua.

## 7. Thông báo (Notifications)
- [x] Model Notification (Hỗ trợ nhiều loại: Hệ thống, Giao dịch, Đơn hàng).
- [x] Service Notifier: Gửi thông báo trong ứng dụng.
- [x] Tích hợp: Thông báo khi nạp tiền thành công, mua hàng thành công.
- [x] API: Danh sách thông báo, đánh dấu đã đọc.

## 8. Hệ thống bổ trợ (Tasks còn lại)
- [ ] **Withdraw System**: API yêu cầu rút tiền về ngân hàng (Dành cho cộng tác viên/Admin).
- [ ] **Blog/News**: Module tin tức, thông báo khuyến mãi trên trang chủ.
- [ ] **Cloud Storage**: Tích hợp AWS S3 hoặc Cloudinary để lưu trữ ảnh thật thay vì URL text.
- [ ] **Voucher/Discount**: Hệ thống mã giảm giá khi mua tài khoản.
- [ ] **Analytics**: API thống kê doanh thu, số lượng đơn hàng cho Admin Dashboard.

## 9. DevOps & Testing
- [ ] Dockerize ứng dụng (Dockerfile, docker-compose).
- [ ] Cấu hình CI/CD (GitHub Actions).
- [ ] Viết Unit Test cho các logic quan trọng (Trừ tiền, Mua hàng).
- [ ] Stress Test API để đảm bảo chịu tải khi có nhiều người mua cùng lúc.

---
*Cập nhật lần cuối: 12/05/2026*
