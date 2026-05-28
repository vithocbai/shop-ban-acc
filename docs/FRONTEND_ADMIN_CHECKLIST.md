# 🖥️ Lộ Trình Phát Triển Frontend Admin - Game Account Marketplace

Tài liệu này phân rã các Task Frontend cực kỳ chi tiết, bám sát luồng thực tế và kiến trúc hệ thống (`ARCHITECTURE.md`).

## 🏁 Trạng Thái Tổng Quan
- [x] **Giai đoạn 1**: Khởi tạo & Layout Core (Khớp 100% Architecture)
- [ ] **Giai đoạn 2**: Xác thực & Bảo mật
- [ ] **Giai đoạn 3**: Triển khai các Module chức năng (Quản lý tài khoản, Đơn hàng...)
- [ ] **Giai đoạn 4**: Cấu hình & Báo cáo

---

## 1. Nền tảng UI & Cấu trúc (Infrastructure)

- [x] Khởi tạo dự án Vite + React + TypeScript + TailwindCSS.
- [x] Cấu hình hệ thống màu sắc (Color Palette) và Typography (Roboto).
- [x] Xây dựng `AdminLayout` với Sidebar phân cấp và Header.
- [x] Thiết lập **Axios Instance** (Interceptors bắt lỗi 401, tự động refresh token).
- [x] Cấu hình React Router (Public routes, Private routes, Protected Admin routes).
- [x] Tích hợp thư viện UI cơ bản (Shadcn UI, Radix UI, Lucide Icons, React Toastify).

## 2. Quản lý Danh mục Game (Game Categories)

<!-- Mục đích: Tạo ra các loại Game (Liên Quân, Tốc Chiến) và định nghĩa Schema để nhập liệu -->

- [x] **Route & Pages** — Tạo `GameManagement.tsx` và gắn route `/admin/games`.
- [x] **Bảng danh sách** — Gọi API GET `/games/` (có phân trang), hiển thị lưới (Grid) hoặc bảng (Table).
- [x] **Modal Thêm/Sửa Game** — Khởi tạo `GameModal.tsx`.
- [x] **Trường dữ liệu cơ bản** — Tên game, Slug, Upload Icon/Banner, Màu chủ đạo, Sắp xếp.
- [x] **Cấu hình thuộc tính động (Attributes Schema)** — Giao diện thêm/xóa/sửa cấu trúc key-value (VD: rank (select), skin (number), server (text)...).
- [x] **Logic API** — Xử lý gọi POST/PUT cập nhật và render lại danh sách.

## 3. Quản lý Tài khoản Game (Account Management)

<!-- Mục đích: Đăng bán Account thuộc về một Game cụ thể, lấy thuộc tính động của Game đó -->

- [x] **Route & Pages** — Tạo `AccountManagement.tsx` và gắn route `/admin/accounts`.
- [x] **Bảng danh sách** — Gọi API GET `/accounts/` với phân trang đầy đủ.
- [x] **Giao diện bảng** — Hiển thị Thumbnail, Code, Title, Badge trạng thái (Đang bán, Đã bán, Tạm ẩn), Giá tiền (có Giảm giá), Hot/VIP.
- [x] **Bộ lọc UI** — Sử dụng Shadcn `Select` để lọc account theo từng Game cụ thể và Trạng thái. Ô Search theo Title/Code (Debounce).
- [x] **Modal Thêm/Sửa Tài khoản** — Tạo `AccountModal.tsx`. Bọc component bằng `{isOpen && ...}` trong parent để giải quyết triệt để lỗi Lifecycle (Reset state).
- [x] **Dữ liệu tĩnh** — Tên tài khoản, Mã tài khoản (VD: LQ123), Giá bán, Giá gốc, Trạng thái, Checkbox VIP/Hot.
- [x] **Dữ liệu động (JSONB)** — Tự động generate các input fields (Text, Number, Select) dựa trên `attributes_schema` của Game đang chọn trong dropdown. Form đồng bộ State mượt mà.
- [x] **Gallery Ảnh** — Module kéo thả/upload nhiều ảnh cùng lúc, preview, set thứ tự và xóa ảnh.
- [x] **Preview Card** — Render thẻ UI "Xem trước" thu nhỏ kế bên form để admin xem thực tế khách sẽ thấy gì.
- [x] **Logic API** — Gọi POST/PUT đóng gói payload chuẩn (Gồm cả JSON `account_data` và danh sách mảng hình ảnh `images[]`).

## 4. Quản lý Đơn hàng (Order Management)

- [ ] **Route & Pages** — Tạo `OrderManagement.tsx` và gắn route `/admin/orders`.
- [ ] **Bảng danh sách đơn hàng** — Gọi API GET `/orders/`.
- [ ] **Thông tin hiển thị** — Mã đơn (Order ID), Người mua (Username), Tài khoản Game đã mua, Tổng tiền, Thời gian, Trạng thái (Hoàn thành/Thất bại).
- [ ] **Drawer/Modal Chi tiết Đơn hàng** — Khởi tạo `OrderDetailDrawer.tsx`.
- [ ] Hiển thị thông tin thanh toán, logs đối soát.
- [ ] Hiển thị account credentials (username/password game) được giao cho khách (Chỉ admin có quyền mới được xem).

## 5. Quản lý Người dùng (User Management)

- [ ] **Route & Pages** — Tạo `UserManagement.tsx` và gắn route `/admin/users`.
- [ ] **Bảng danh sách user** — Gọi API GET `/users/`, hiển thị Avatar, Username, Email, Số dư (Balance VND), Role, Trạng thái (Active/Banned).
- [ ] **Thanh công cụ** — Lọc theo Role, Tìm kiếm Email/Username.
- [ ] **Modal Chi tiết/Cập nhật** — Khởi tạo `UserDetailModal.tsx`.
- [ ] Thay đổi Role (Admin, User).
- [ ] **Biến động số dư** — Nút "Cộng/Trừ tiền tay" đi kèm input nhập Lý do (Ghi log hệ thống).
- [ ] Khóa/Mở khóa tài khoản người dùng (Ban/Unban).
- [ ] Xem lịch sử mua hàng, lịch sử nạp tiền của user đó (Render thành các tab con bên trong Modal chi tiết).

## 6. Quản lý Nạp tiền (Deposit Management)

- [ ] **Route & Pages** — Tạo `DepositManagement.tsx` và gắn route `/admin/deposits`.
- [ ] **Bảng yêu cầu nạp tiền** — Gọi API GET `/deposits/`.
- [ ] Phân loại 3 Tab trạng thái: Chờ duyệt, Đã duyệt, Từ chối.
- [ ] Phân loại phương thức: Chuyển khoản NH, Momo, Thẻ cào.
- [ ] **Duyệt thủ công** — Nút Action Duyệt/Từ chối cho các giao dịch chuyển khoản.
- [ ] **Log Auto-Bank** — Hiển thị danh sách payload từ API ngân hàng (nếu có webhook tự động tích hợp).

## 7. Cấu hình Hệ thống & CMS (System Settings)

- [ ] **Route & Pages** — Phân ra `SettingsGeneral.tsx`, `SettingsBanners.tsx`.
- [ ] **Thông tin Website** — Cấu hình Logo, Tên Web, Hotline, Email liên hệ, Cấu hình SEO (Title, Description).
- [ ] **Slider/Banner** — Quản lý hình ảnh chạy ở trang chủ (Upload banner, thay đổi thứ tự, Ẩn/Hiện).
- [ ] **Cấu hình thanh toán** — Thêm/Xóa thông tin STK ngân hàng/Momo hiển thị cho user chuyển khoản.
- [ ] **Bảo mật & Log** — Bảng hiển thị Nhật ký hệ thống (Admin nào vừa xóa Acc, Admin nào vừa cộng tiền...).

## 8. Dashboard & Thống kê (Analytics)

- [ ] **Route & Pages** — Cập nhật `AdminDashboard.tsx` tại `/admin`.
- [ ] **Card Thống kê (Summary)** — Doanh thu hôm nay/tháng này, Số tài khoản đang bán, Đơn hàng mới, Thành viên mới.
- [ ] **Biểu đồ (Charts)** — Tích hợp `Chart.js` hoặc `Recharts`.
- [ ] Vẽ biểu đồ đường (Line chart) Doanh thu 7 ngày / 30 ngày qua.
- [ ] Vẽ biểu đồ tròn (Pie chart) tỷ trọng bán hàng theo từng Game.
- [ ] **Bảng xếp hạng (Leaderboards)** — Top Game bán chạy nhất, Top người dùng nạp tiền/chi tiêu nhiều nhất.

---
*Cập nhật lần cuối: 28/05/2026*
