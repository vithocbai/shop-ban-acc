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

## 2. Quản lý Danh mục Game (Game Categories)

*Mục đích: Định nghĩa các game đang kinh doanh (Liên Quân, Ngọc Rồng...) làm cơ sở để phân loại Tài khoản.*

- [x] **Page Component**: Khởi tạo `src/pages/admin/GameManagement.tsx`.
- [x] **Data Fetching**: Viết hook `useGamesQuery()` sử dụng React Query gọi API `GET /api/admin/games/`.
- [x] **Bảng Hiển Thị (Data Table)**:
  - Xây dựng bảng hiển thị các cột: Icon, Tên Game, Slug, Trạng thái (Active/Hidden).
  - Tích hợp Component `Pagination` kết hợp `Select` (Rows per page). Cấu hình đổi trang sẽ reset data mượt mà.
- [x] **Form Thêm/Sửa (Modal)**:
  - Tạo `GameFormModal.tsx` sử dụng `Dialog` của shadcn.
  - Quản lý form bằng **React Hook Form** + Validate dữ liệu bằng **Zod** schema.
  - Các trường: Tên game (Tự động gen Slug), Icon URL, Banner URL, Theme Color, Sắp xếp (Number), Trạng thái.
- [x] **API Mutate**: Viết hook `useCreateGameMutation()` và `useUpdateGameMutation()`. Xử lý gọi API, hiển thị Toast (Success/Error), và gọi `queryClient.invalidateQueries` để update lại bảng sau khi save.

---

## 3. Quản lý Tài khoản Game (Account Management)

*Mục đích: Quản lý kho Acc, định giá, tải ảnh và nhập các thuộc tính đặc thù theo Game (Rank, Vũ khí...).*

- [x] **Page Component**: Tạo `AccountManagement.tsx` (Route: `/admin/accounts`).
- [x] **Thanh Công Cụ (Toolbar & Filters)**:
  - `Input`: Ô Search Debounce (Tìm theo Code hoặc Title).
  - `Select`: Lọc theo Game ID.
  - `Select`: Lọc theo Status (Available, Reserved, Sold, Locked, Hidden).
  - Nút "Thêm Tài Khoản Mới". Bất kỳ thay đổi Filter nào cũng phải ép `page` về `1`.
- [x] **Bảng Danh Sách**:
  - Hiển thị: Thumbnail (Hình nhỏ), Mã Acc, Game, Giá bán, Giá gốc, Trạng thái (Dùng `Badge` tô màu khác nhau), Ngày tạo, Action (Sửa/Xóa).
- [x] **Modal Form (Cơ bản)**: Tạo `AccountFormModal.tsx`. Xử lý unmount form khi đóng modal (`{isOpen && <Form/>}`) để tránh lỗi rác state.
  - Các trường cố định: Game (Dropdown chọn từ API `/games/`), Tiêu đề, Mã tài khoản, Giá, Giá gốc, Trạng thái.
- [x] **Dữ liệu động (Dynamic JSONB Fields)**:
  - Dựa vào Game được chọn, giao diện form tự động chèn thêm các Input tương ứng với đặc thù Game đó (VD: Chọn Liên Quân hiện field `Rank`, `Skins`).
  - Đóng gói dữ liệu này thành cục JSON Object map vào trường `account_data` gửi xuống backend.
- [x] **Quản lý Hình ảnh (Gallery Uploader)**:
  - Xây dựng component upload nhiều ảnh: Kéo thả file, chọn file.
  - Preview ảnh dạng Grid. Hỗ trợ thay đổi thứ tự ảnh (Kéo thả hoặc nút Up/Down) và nút xóa ảnh.
- [x] **Preview Card**: Component phụ kế bên Form để Admin nhìn thấy giao diện hiển thị thẻ Acc thực tế ngoài public khi nhập liệu.

---

## 4. Quản lý Đơn hàng (Order Management)

*Mục đích: Đối soát đơn hàng, kiểm tra lịch sử mua, và lấy lại thông tin tài khoản đã giao cho khách.*

- [x] **Page Component**: Tạo `OrderManagement.tsx` (Route `/admin/orders`).
- [x] **Bảng Danh Sách**:
  - Gọi API `GET /api/admin/orders/`.
  - Hiển thị: Mã đơn, Khách hàng (User), Sản phẩm (Tên acc), Tổng tiền, Trạng thái thanh toán (Thành công/Thất bại), Trạng thái giao hàng (Đã giao/Chờ xử lý), Ngày mua.
- [x] **Chi Tiết Đơn Hàng (Sheet/Drawer)**:
  - Tạo `OrderDetailDrawer.tsx` (Dùng `Sheet` component kéo ra từ cạnh phải màn hình).
  - Tab 1 (Thông tin chung): Hiển thị biên lai, phương thức thanh toán, logs đối soát.
  - Tab 2 (Delivery Info): Khu vực Nhạy cảm. Hiển thị thông tin đăng nhập thực tế của Account (Tài khoản/Mật khẩu game) đã gửi cho khách. Yêu cầu có nút "Nhấn để xem" thay vì hiện thẳng chữ.

---

## 5. Quản lý Người dùng & Phân quyền (User Management & RBAC)

*Mục đích: Quản lý khách hàng, thiết lập quyền truy cập cho nhân sự hệ thống, can thiệp số dư hoặc trạng thái tài khoản.*

- [x] **Bảng Danh Sách & Tìm kiếm (`UserList.tsx`)**: Hiển thị thông tin tổng quan, bộ lọc đa năng (theo quyền, trạng thái) và ô tìm kiếm. Tích hợp phân trang tự động.
- [x] **Modal Thêm Người Dùng (`UserCreateModal.tsx`)**: Giao diện tạo mới User với đầy đủ Validation. Cho phép setup Username, Email, Mật khẩu, Vai trò, Trạng thái, và Số dư khởi tạo ngay từ đầu.
- [x] **Modal Chỉnh sửa Thông Tin (`UserEditModal.tsx`)**: Cập nhật thông tin cơ bản (Avatar, Phone, Email, Username).
- [x] **Modal Phân Quyền Cơ Bản (`UserRoleModal.tsx`)**: Đổi vai trò (Role) và cập nhật Trạng thái hoạt động (Active/Banned/Pending).
- [x] **Modal Đặt Lại Mật Khẩu (`UserChangePasswordModal.tsx`)**: Dành cho Admin force-reset mật khẩu của User bất kỳ mà không cần biết mật khẩu cũ.
- [x] **Action Xóa Người Dùng**: Tích hợp Soft Delete, có cảnh báo nguy hiểm trước khi xóa (`ConfirmModal`).
- [x] **Cộng/Trừ Số Dư Thủ Công**: Admin có quyền cộng trừ tiền và bắt buộc nhập lý do (để lưu log giao dịch minh bạch).
- [ ] **[Sắp ra mắt] Giao diện Quản lý Nhóm người dùng (User Group)**: Trang hiển thị danh sách các nhóm như Admin, Moderator, CSKH, Kế toán...
- [ ] **[Sắp ra mắt] Giao diện Phân Quyền Động (RBAC)**: Ma trận Checkbox trực quan phân quyền (Xem, Thêm, Sửa, Xóa, Xuất dữ liệu) chi tiết tới từng Module.

---

## 6. Quản lý Nạp tiền (Deposit Management)

*Mục đích: Duyệt thủ công các biên lai chuyển khoản ngân hàng/Momo do người dùng tải lên.*

- [ ] **Page Component**: Tạo `DepositManagement.tsx` (Route `/admin/deposits`).
- [ ] **Giao Diện Quản Lý**:
  - Sử dụng `Tabs` để phân 3 luồng: `Chờ duyệt` (Pending), `Đã duyệt` (Approved), `Từ chối` (Rejected).
- [ ] **Bảng Chờ Duyệt**:
  - Hiển thị: ID nạp, User, Số tiền yêu cầu, Phương thức, Ngày tạo.
  - Nút "Xem biên lai" (Mở modal xem ảnh bill phóng to).
- [ ] **Hành động Duyệt/Từ chối**:
  - Nút **Approve**: Mở Dialog xác nhận, nếu OK gọi API duyệt -> Số dư user được cộng ngay lập tức.
  - Nút **Reject**: Mở Dialog yêu cầu nhập "Lý do từ chối" -> Thông báo cho user biết bill bị lỗi gì.

---

## 7. Dashboard & Thống kê (Analytics)

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

## 8. Cấu hình Hệ thống & CMS (System Settings)

*Mục đích: Tùy chỉnh web không cần đụng vào code.*

- [ ] **Page Component**: `SystemSettings.tsx` với dạng Layout có Sidebar dọc bên trái để điều hướng các cấu hình.
- [ ] **Cấu Hình Web**: Cập nhật Logo URL, Tên Website, Hotline, Meta Title/Description cho SEO. (Dữ liệu lưu vào bảng `system_settings` dưới dạng key-value).
- [ ] **Cấu Hình Banner/Slider**:
  - Thêm/Sửa/Xóa ảnh Banner chạy slide ở trang chủ. Upload ảnh, gán Link chuyển hướng khi click.
- [ ] **Cấu Hình Thanh Toán**: Cập nhật Tên Chủ Tài Khoản, Số Tài Khoản, Ngân Hàng để hiển thị ở trang nạp tiền của khách.
- [ ] **System Logs (Nhật Ký)**: Bảng read-only hiển thị `django_admin_log` (Ai vừa làm gì, lúc nào).

---
*Cập nhật lần cuối: 30/05/2026 - Bản chi tiết kịch bản triển khai Frontend Admin*
