# 🖥️ Lộ Trình Phát Triển Frontend Admin - Game Account Marketplace

Tài liệu này bám sát cấu trúc Admin Dashboard quy định trong `ARCHITECTURE.md`.

## 🏁 Trạng Thái Tổng Quan
- [x] **Giai đoạn 1**: Khởi tạo & Layout Core (Khớp 100% Architecture)
- [ ] **Giai đoạn 2**: Xác thực & Bảo mật
- [ ] **Giai đoạn 3**: Triển khai các Module chức năng (Quản lý tài khoản, Đơn hàng...)
- [ ] **Giai đoạn 4**: Cấu hình & Báo cáo

---

## 1. Nền tảng UI & Cấu trúc (Infrastructure)
- [x] Khởi tạo dự án Vite + React + TypeScript + TailwindCSS.
- [x] Cấu hình hệ màu và Font Roboto chuẩn.
- [x] Xây dựng `AdminLayout` với Sidebar phân cấp theo đúng sơ đồ cây.
- [ ] Thiết lập **Axios Instance** (JWT Interceptors).

## 2. Quản lý Tài khoản (Account Management)
- [ ] **Tài khoản game**: Danh sách, đăng bán (Dynamic JSON fields), chỉnh sửa.
- [ ] **Danh mục game**: Quản lý các loại game (Liên Quân, Ngọc Rồng...).

## 3. Quản lý Đơn hàng (Order Management)
- [ ] **Danh sách đơn hàng**: Quản lý các đơn mua tài khoản.
- [ ] **Lịch sử giao dịch**: Chi tiết biến động số dư hệ thống.

## 4. Quản lý Người dùng (User Management)
- [ ] **Danh sách người dùng**: Xem thông tin, khóa/mở tài khoản.
- [ ] **Phân quyền**: Quản lý Role (ADMIN, MODERATOR...).
- [ ] **Nhóm người dùng**: Phân loại user theo cấp độ.

## 5. Quản lý Nạp tiền (Deposit Management)
- [ ] **Nạp tiền thủ công**: Duyệt các yêu cầu Bank/Momo.
- [ ] **Thẻ nạp**: Tích hợp gạch thẻ cào.
- [ ] **Lịch sử nạp tiền**: Theo dõi dòng tiền nạp vào.

## 6. Quản lý Nội dung (CMS)
- [ ] **Tin tức**: Quản lý bài viết blog.
- [ ] **Banner**: Cấu hình ảnh slider trang chủ.
- [ ] **Thông báo hệ thống**: Gửi thông báo toàn trang.

## 7. Cấu hình Hệ thống (System Settings)
- [ ] **Cài đặt chung**: Thông tin shop, hotline, logo.
- [ ] **Cài đặt thanh toán**: Cấu hình STK ngân hàng, API ví.
- [ ] **Cài đặt bảo mật**: Cấu hình IP whitelist, giới hạn login.
- [ ] **Nhật ký hệ thống**: Log thao tác của Admin/User.

## 8. Báo cáo Thống kê (Analytics)
- [ ] Biểu đồ doanh thu, số lượng đơn hàng, top game bán chạy.

---
*Cập nhật lần cuối: 12/05/2026*
