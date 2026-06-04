# 🖥️ Lộ Trình Phát Triển Frontend Admin - Game Account Marketplace

Tài liệu phân rã các Task Frontend chi tiết đến từng Component, thư viện sử dụng và luồng dữ liệu (Data Flow), bám sát hoàn toàn với kiến trúc hệ thống (`ARCHITECTURE.md`) và thiết kế Database (`DATA-SCHEMA.md`).

---

## 🏁 Trạng Thái Tổng Quan (Milestones)
- [x] **Giai đoạn 1**: Khởi tạo nền tảng & Layout Core
- [ ] **Giai đoạn 2**: Xác thực, Phân quyền & Quản lý Danh mục Game
- [ ] **Giai đoạn 3**: Quản lý Kho Tài khoản (Dynamic JSONB) & Hình ảnh
- [ ] **Giai đoạn 4**: Quản lý Đơn hàng, Giao dịch Nạp tiền & Người dùng
- [ ] **Giai đoạn 5**: Dashboard Thống kê & CMS Cấu hình Hệ thống

---

## 1. Nền tảng UI & Cấu trúc (Infrastructure)

- [x] **Khởi tạo Project**: Set up Vite + React 19 + TypeScript + TailwindCSS v4.
- [x] **UI Components Base**: Cài đặt **shadcn/ui** (Button, Input, Select, Dialog, Table, Pagination, Tabs, Toast/Sonner, Sheet/Drawer, Form, Card).
- [x] **Routing System (React Router v7)**:
  - Cấu hình `BrowserRouter` với cấu trúc lồng nhau (Nested Routes).
  - Tạo `ProtectedRoute.tsx` để chặn người dùng chưa đăng nhập.
  - Tạo `AdminRoute.tsx` để check Role (Chỉ cho phép `ADMIN` hoặc `SUPER_ADMIN`).
- [x] **HTTP Client (Axios)**:
  - Tạo file `services/api.ts` chứa custom Axios instance.
  - Viết Request Interceptor: Tự động đính kèm `Authorization: Bearer <token>`.
  - Viết Response Interceptor: Xử lý tự động Refresh Token khi gặp lỗi 401 Unauthorized, và logout nếu refresh thất bại.
- [x] **State Management**:
  - Cài đặt **Zustand** (`useAuthStore`) để lưu trữ JWT Token và thông tin User hiện tại.
  - Cài đặt **React Query** (`QueryClientProvider`) để quản lý Server State, Caching, và Mutating data.
- [x] **Layout Template**: Xây dựng `AdminLayout.tsx` gồm:
  - `AdminSidebar.tsx`: Chứa các menu điều hướng (dùng `lucide-react` icons), highlight active route.
  - `AdminHeader.tsx`: Chứa User Dropdown (Đăng xuất, Đổi mật khẩu), hiển thị Breadcrumbs.

---

## 2. Báo cáo thống kê (Analytics)

*Mục đích: Cái nhìn tổng quan về sức khỏe kinh doanh của hệ thống.*

- [ ] **Page Component**: Tạo `AdminDashboard.tsx` (Route `/admin/dashboard` - Trang mặc định khi login Admin).
- [ ] **Summary Cards (Thẻ thông số)**:
  - Dùng Card hiển thị: Doanh thu (Hôm nay, Tuần này, Tháng này), Tổng số Acc đang bán, Tổng đơn hàng thành công, Tổng User đăng ký. Gắn kèm Icon và % tăng trưởng.
- [ ] **Biểu đồ (Charts)**:
  - Cài đặt thư viện **Recharts** hoặc **Chart.js**.
  - **Biểu đồ đường (Line Chart)**: Thống kê Doanh thu 30 ngày gần nhất. Trục X là ngày, Trục Y là số tiền.
  - **Biểu đồ tròn (Pie Chart)**: Tỉ trọng doanh số bán ra theo từng thể loại Game (VD: LQ chiếm 60%, Tốc Chiến 40%).
- [ ] **Leaderboard Tables**:
  - Bảng "Khách hàng chi tiêu nhiều nhất" (Top VIP Users).
  - Bảng "Các đơn hàng giao dịch gần đây nhất".

---

## 3. Quản lý Tài khoản & Game (Account & Game Inventory)

*Mục đích: Quản lý danh mục game và kho tài khoản chi tiết.*

- [x] **Danh mục Game (`/admin/games`)**: 
  - Bảng dữ liệu hiển thị Icon, Tên Game, Slug, Trạng thái.
  - Form Thêm/Sửa bằng React Hook Form + Zod. Cấu hình tự động gen Slug.
- [x] **Kho Tài khoản (`/admin/accounts`)**:
  - Thanh công cụ mạnh mẽ: Search debounce, Lọc theo Game ID, Status.
  - Bảng danh sách: Thumbnail, Mã, Giá, Trạng thái (Tô màu badge), Ngày tạo.
  - Form Dữ liệu động (Dynamic JSONB Fields): Tự động render Input tùy theo Game (VD: Liên Quân có field Rank, Skins).
  - Quản lý Hình ảnh (Gallery Uploader): Upload nhiều ảnh, kéo thả thay đổi thứ tự.
  - Preview Card: Xem trước thẻ Acc giống ngoài trang khách.

---

## 4. Quản lý Đơn hàng & Giao dịch (Order & Transaction)

*Mục đích: Đối soát đơn hàng, kiểm tra lịch sử mua, và lấy lại thông tin tài khoản đã giao cho khách.*

- [x] **Danh sách đơn hàng (`/admin/orders`)**:
  - Bảng hiển thị: Mã đơn, Khách hàng, Sản phẩm, Tổng tiền, Trạng thái thanh toán, Trạng thái giao hàng, Ngày mua.
- [x] **Chi tiết đơn hàng (Drawer)**:
  - Tab 1: Thông tin chung (Biên lai, phương thức thanh toán, logs).
  - Tab 2 (Khu vực nhạy cảm): Thông tin đăng nhập thực tế của Account (ID/Pass) đã giao cho khách. Có nút "Nhấn để xem" bảo mật.
- [ ] **Lịch sử giao dịch (`/admin/transactions`)**:
  - Bảng lưu vết toàn bộ biến động số dư của tất cả người dùng (Mua, Nạp, Rút).

---

## 5. Quản lý Người dùng (User, Group, Role)

*Mục đích: Quản lý khách hàng, thiết lập quyền truy cập cho nhân sự hệ thống, can thiệp số dư hoặc trạng thái tài khoản.*

- [x] **Danh sách Người dùng (`/admin/users`)**: 
  - Bảng tổng quan, bộ lọc đa năng (Role, Status), ô tìm kiếm và phân trang tự động.
- [x] **Form Người Dùng**: Thêm mới (Gán role/balance), Sửa thông tin cơ bản.
- [x] **Cập nhật Quyền & Trạng thái**: Đổi vai trò và trạng thái (Active/Banned/Pending).
- [x] **Action Xóa / Reset Mật khẩu**: Nút Soft Delete an toàn. Nút Force Reset mật khẩu (Không cần mật khẩu cũ).
- [x] **Cộng/Trừ Số Dư Thủ Công**: Admin có quyền cộng trừ tiền và bắt buộc nhập lý do (để lưu log giao dịch minh bạch).
- [ ] **Nhóm người dùng (`/admin/user-groups`)**: Trang hiển thị danh sách các nhóm như Admin, Moderator, CSKH, Kế toán...
- [ ] **Phân Quyền Động (`/admin/roles`)**: Ma trận Checkbox trực quan phân quyền (Xem, Thêm, Sửa, Xóa, Xuất dữ liệu) chi tiết tới từng Module.

---

## 6. Quản lý Nạp tiền (Deposit Management)

*Mục đích: Quản lý toàn diện các hình thức nạp tiền: nạp thẻ cào, admin nạp thủ công, và xem lịch sử giao dịch.*

- [ ] **1. Nạp tiền thủ công (`/admin/deposits/manual`)**:
  - Giao diện gồm 2 cột: Cột trái (Tìm kiếm người dùng, Nhập số tiền, Phương thức, Ghi chú). Cột phải (Thông tin giao dịch: Số tiền nạp, phí, thực nhận).
  - Cho phép Admin trực tiếp cộng tiền vào tài khoản người dùng kèm theo ghi chú (VD: Chuyển khoản ngân hàng).
- [ ] **2. Quản lý Thẻ nạp (`/admin/deposits/cards`)**:
  - **Summary Cards**: Hiển thị tổng thẻ, thẻ hoạt động, thẻ đã dùng, thẻ khóa.
  - **Bảng dữ liệu**: ID, Mã thẻ, Serial, Mệnh giá, Trạng thái, Ngày tạo.
  - **Tính năng**: Nút "Tạo thẻ mới" cho phép gen hàng loạt thẻ cào/voucher. Hỗ trợ lọc theo mệnh giá và trạng thái.
- [x] **3. Lịch sử nạp tiền (`/admin/deposits/history`)**:
  - **Summary Cards**: Tổng giao dịch, Tổng số tiền nạp, Nạp thành công, Nạp thất bại (hiển thị %).
  - **Bảng dữ liệu**: ID, Người dùng, Phương thức, Số tiền, Phí GD, Thực nhận, Trạng thái, Thời gian, Ghi chú.
  - Hỗ trợ bộ lọc nâng cao (Thời gian, Phương thức, Trạng thái) và Nút "Xuất dữ liệu" (Export Excel/CSV).

---

## 7. Quản lý Nội dung (CMS)

*Mục đích: Quản lý bài viết, banner sự kiện và thông báo đẩy.*

- [ ] **Tin tức (`/admin/news`)**: Quản lý bài viết, chuyên mục, SEO. Tích hợp trình soạn thảo Rich Text (VD: TipTap / CKEditor).
- [ ] **Banner (`/admin/banners`)**: Thêm/Sửa/Xóa ảnh Banner chạy slide ở trang chủ. Upload ảnh, gán Link chuyển hướng khi click.
- [ ] **Thông báo (`/admin/notifications`)**: Gửi thông báo hệ thống (Push notification) tới toàn bộ thành viên hoặc 1 thành viên cụ thể.

---

## 8. Cấu hình Hệ thống & Logs (System Settings)

*Mục đích: Tùy chỉnh web không cần đụng vào code và giám sát thao tác nhân sự.*

- [ ] **Page Component**: `SystemSettings.tsx` với dạng Layout có Sidebar dọc bên trái để điều hướng các cấu hình.
- [ ] **Cài đặt chung (`/admin/settings/general`)**: Cập nhật Logo URL, Tên Website, Hotline, Meta Title/Description cho SEO.
- [ ] **Cài đặt thanh toán (`/admin/settings/payment`)**: Cập nhật Tên Chủ Tài Khoản, Số Tài Khoản, Ngân Hàng để hiển thị ở trang nạp tiền của khách.
- [ ] **Cài đặt bảo mật (`/admin/settings/security`)**: Cấu hình 2FA, OTP.
- [ ] **System Logs (`/admin/settings/logs`)**: Bảng read-only hiển thị `django_admin_log` (Ai vừa làm gì, lúc nào).

---
*Cập nhật lần cuối: 30/05/2026 - Bản chi tiết kịch bản triển khai Frontend Admin*
