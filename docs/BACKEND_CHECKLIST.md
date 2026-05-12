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

## 2. Người dùng & Phân quyền (User)
- [x] Triển khai Custom User Model (Email làm định danh, Balance, Role, Status).
- [x] API Đăng ký / Đăng nhập (JWT Authentication).
- [x] API Quên mật khẩu / Đổi mật khẩu.
- [x] Cập nhật Profile (Avatar, Số điện thoại).
- [ ] Tích hợp Đăng nhập MXH (Google, Facebook).

## 3. Danh mục Game (Game)
- [x] Model Game (Slug, Icon, Theme color).
- [x] API Public: Xem danh sách Game đang hoạt động.
- [x] API Admin: CRUD danh mục Game.

## 4. Quản lý Tài khoản (Account)
- [x] Model Account (Sử dụng JSONB cho dữ liệu động: Rank, Skin...).
- [x] Model AccountImage (Gallery ảnh chi tiết).
- [x] API Public: Danh sách tài khoản kèm bộ lọc nâng cao.
- [x] API Public: Xem chi tiết tài khoản.
- [x] API Admin: Đăng bán tài khoản, cập nhật trạng thái.

## 5. Thanh toán & Giao dịch (Payment/Transaction)
- [x] Model Transaction: Ghi log biến động số dư.
- [x] Service `update_user_balance`: Xử lý tiền an toàn (Atomic).
- [x] Model Deposit: Quản lý nạp tiền (Bank, Momo).
- [x] API Admin: Duyệt/Từ chối nạp tiền.
- [x] API User: Xem lịch sử giao dịch.

## 6. Đơn hàng & Giỏ hàng (Order/Cart)
- [x] Model Order & OrderItem.
- [x] Service `purchase_account`: Logic mua hàng nguyên tử.
- [x] API Checkout: Mua hàng nhanh.
- [ ] API Cart: Giỏ hàng (Optional cho shop bán lẻ).

## 7. Thông báo & Nội dung (Notification/News/Banner)
- [x] Model Notification: Thông báo in-app.
- [x] API/Service Notifier: Gửi thông báo tự động khi nạp/mua.
- [ ] **News**: API tin tức hệ thống.
- [ ] **Banner**: API quản lý slide trang chủ.

## 8. Hệ thống bổ trợ (Tasks còn lại)
- [ ] **Withdraw**: API yêu cầu rút tiền.
- [ ] **Analytics**: API thống kê báo cáo (Revenue, Users).
- [ ] **Upload**: Tối ưu hóa hệ thống lưu trữ ảnh (S3/Cloudinary).
- [ ] **System Config**: Cấu hình shop linh hoạt qua DB.

## 9. DevOps & Testing
- [ ] Dockerize ứng dụng.
- [ ] Cấu hình CI/CD.
- [ ] Viết Unit Test cho Core Logic.

---
*Cập nhật lần cuối: 12/05/2026*
