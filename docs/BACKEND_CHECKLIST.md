# 🛠 Lộ Trình Phát Triển Backend - Game Account Marketplace

Tài liệu này tổng hợp danh sách các công việc Backend, bám sát kiến trúc quy định trong `ARCHITECTURE.md`.

## 🏁 Trạng Thái Tổng Quan
- [x] **Giai đoạn 1**: Khởi tạo & Nền tảng (100%)
- [x] **Giai đoạn 2**: Core Modules (100%)
- [x] **Giai đoạn 3**: Giao dịch & Đơn hàng (100%)
- [x] **Giai đoạn 4**: Xác thực & Bảo mật (100%)
- [ ] **Giai đoạn 5**: Hệ thống bổ trợ & Tối ưu (20%)

---

## 1. Khởi tạo & Nền tảng (Common/Core)
- [x] Thiết lập cấu trúc Monorepo và Django Project.
- [x] Cấu hình môi trường (`.env`, `base/dev/prod settings`).
- [x] Triển khai Base Models (`TimestampedModel`, `SoftDeleteModel`).
- [x] **Refactor Architecture**: Đồng bộ hóa cấu trúc cây thư mục (Singular naming, core apps).
- [x] Tích hợp Swagger/Redoc để tự động làm tài liệu API.
- [x] Viết Script Seed Data (Dữ liệu mẫu cho Game, Account, Admin).
- [x] Chuẩn hóa Phân trang (Pagination) & Response Envelope cho toàn bộ API (`ResponseEnvelopeMixin`).

## 2. Quản lý Người dùng (User, Group, Role)
- [x] Triển khai Custom User Model (Email làm định danh, Balance, Role, Status).
- [x] API Đăng ký / Đăng nhập (JWT Authentication).
- [x] API Quên mật khẩu / Đổi mật khẩu cá nhân.
- [x] Cập nhật Profile (Avatar, Số điện thoại).
- [x] API Admin: Lấy danh sách, tìm kiếm, lọc và phân trang.
- [x] API Admin: Thêm/Sửa/Xóa người dùng (Soft Delete an toàn).
- [x] API Admin: Cộng/trừ số dư thủ công (kèm log Transaction).
- [ ] **[Sắp ra mắt]** Nhóm người dùng: API CRUD các nhóm nhân sự (Admin, CSKH...).
- [ ] **[Sắp ra mắt]** Phân quyền động (RBAC): Thiết lập ma trận quyền hạn cho nhóm.
- [ ] Tích hợp Đăng nhập MXH (Google, Facebook).

## 3. Quản lý Nạp tiền (Deposit, Card, History)
- [x] **Lịch sử nạp tiền (Deposit History)**: Lưu trữ các yêu cầu nạp tiền (Deposit).
- [ ] **Nạp tiền thủ công (Manual Deposit)**: API cho phép Admin tra cứu và trực tiếp cộng tiền cho user (Mở rộng từ API cộng/trừ số dư).
- [ ] **Thẻ nạp (Card Deposit)**: Model và API quản lý sinh mã thẻ cào (Voucher/Card), trạng thái (hoạt động/đã dùng/khóa) và logic xử lý khi user nhập mã.

## 4. Quản lý Tài khoản & Game (Account & Game Inventory)
- [x] **Danh mục Game**: Model và API CRUD danh mục Game (Liên Quân, Ngọc Rồng...).
- [x] **Quản lý Tài khoản**: Model Account sử dụng JSONB lưu trữ dữ liệu động (Rank, Skin...).
- [x] Hình ảnh chi tiết (Gallery AccountImage).
- [x] API Public: Xem danh sách tài khoản, chi tiết tài khoản.
- [x] API Admin: Quản lý kho, đăng bán, sửa giá.

## 5. Quản lý Đơn hàng & Giao dịch (Order & Transaction)
- [x] **Lịch sử Giao dịch**: Ghi vết biến động số dư (Transaction).
- [x] Service `update_user_balance`: Xử lý giao dịch an toàn (Atomic).
- [x] **Quản lý Đơn hàng**: Model Order & OrderItem.
- [x] Service `purchase_account`: Logic mua tài khoản và trừ tiền tự động.
- [x] API Checkout mua hàng (Tự động chuyển thông tin tài khoản cho khách).

## 6. Quản lý Nội dung (CMS - News, Banner, Notification)
- [x] **Thông báo**: Model và API Notification (Gửi thông báo nạp/mua thành công).
- [ ] **Tin tức (News)**: API quản lý bài viết blog/hướng dẫn.
- [ ] **Banner**: API quản lý slideshow quảng cáo trang chủ.

## 7. Báo cáo thống kê (Analytics)
- [ ] **Dashboard**: API tổng hợp doanh thu (ngày/tuần/tháng), tổng đơn, người dùng.
- [ ] **Biểu đồ & Top**: Dữ liệu biểu đồ doanh thu, tỷ trọng game bán chạy, top khách hàng VIP.

## 8. Cấu hình hệ thống & DevOps (System Settings)
- [ ] **Cài đặt chung**: API cấu hình thông tin web (Logo, Hotline, Meta).
- [ ] **Cài đặt thanh toán**: API thiết lập tài khoản ngân hàng nhận tiền.
- [ ] **Nhật ký hệ thống (System Logs)**: API truy xuất `django_admin_log`.
- [x] Viết Unit Test cho Core Logic.
- [ ] Dockerize ứng dụng và cấu hình CI/CD.

---
*Cập nhật lần cuối: 30/05/2026 - Đồng bộ hoàn toàn với kiến trúc 7 Modules*
