# 🔔 QUY TRÌNH HỆ THỐNG THÔNG BÁO (NOTIFICATION WORKFLOW)

Tài liệu này mô tả chi tiết luồng hoạt động của hệ thống Thông báo (Notification) dành cho cả Frontend và Backend, bao gồm các kịch bản thực tế khi nạp tiền và mua tài khoản.

---

## 1. KIẾN TRÚC & PHÂN LOẠI THÔNG BÁO

Hệ thống hỗ trợ 2 nhóm đối tượng nhận thông báo chính:
1. **User (Khách hàng)**: Nhận thông báo cá nhân (Tiền đã vào tài khoản, mua thành công, hoặc admin huỷ nạp tiền).
2. **Admin (Quản trị viên)**: Nhận thông báo vận hành (Có khách tạo yêu cầu nạp tiền, có khách vừa mua tài khoản).

Các loại (`Type`) thông báo được quy định trong Database (`models.py`):
- `PAYMENT`: Liên quan đến nạp/rút tiền, duyệt/từ chối nạp.
- `ORDER`: Liên quan đến mua bán Account.
- `SYSTEM` / `PROMOTION`: Thông báo chung từ hệ thống hoặc khuyến mãi.

---

## 2. KỊCH BẢN TỰ ĐỘNG BẮN THÔNG BÁO (BACKEND)

### 2.1. Kịch bản: Khách hàng Nạp tiền (Deposit)
1. **Khách tạo yêu cầu nạp tiền** (`POST /api/deposits/`):
   - Hàm `perform_create` trong Backend tự động gọi `notify_admins()`.
   - Toàn bộ Admin sẽ nhận được: *"Có yêu cầu nạp tiền mới - User [A] vừa tạo yêu cầu nạp [X]đ"*.
2. **Admin Duyệt tiền** (`POST /admin/deposits/:id/approve/`):
   - Hàm duyệt gọi `notify_user()`.
   - Khách hàng nhận được: *"Nạp tiền thành công - Yêu cầu nạp [X]đ đã được duyệt"*.
3. **Admin Từ chối** (`POST /admin/deposits/:id/reject/`):
   - Hàm từ chối gọi `notify_user()`.
   - Khách hàng nhận được: *"Nạp tiền thất bại - Lý do: [Ghi chú của admin]"*.

### 2.2. Kịch bản: Khách hàng Mua Account (Order)
1. **Khách chốt mua tài khoản** (`POST /orders/create/`):
   - Service `purchase_account` sẽ thực hiện trừ tiền và chuyển trạng thái Acc.
   - Gọi `notify_user()` để báo cho Khách: *"Mua tài khoản thành công [Mã Acc]"*.
   - Gọi `notify_admins()` để báo cho Admin: *"Tài khoản vừa được bán - User [A] vừa mua [Mã Acc]"*.

---

## 3. QUY TRÌNH HIỂN THỊ (FRONTEND)

Vì dự án sử dụng API RESTful truyền thống (không dùng WebSocket / Real-time), nên Frontend sử dụng chiến lược **Fetching on Interaction (Tải dữ liệu khi tương tác)** để tối ưu hiệu suất server mà vẫn đảm bảo tính "động" cho người dùng:

### 3.1. Tại trang Admin (`AdminLayout.tsx`)
- **Tải lần đầu (Mount)**: Khi Admin vừa F5 hoặc đăng nhập vào hệ thống, thẻ `<Bell />` gọi `notificationService.getNotifications()` để lấy số đếm (Badge) và danh sách ban đầu.
- **Tải khi tương tác (onOpenChange)**: Khi Admin **click vào biểu tượng Chuông**, `DropdownMenu` sẽ bắt sự kiện mở và lập tức gọi API ngầm để kéo dữ liệu mới nhất về. Điều này giúp Admin luôn thấy thông báo (Khách mới nạp tiền, khách mua acc) ngay lập tức mà không cần F5 trình duyệt.
- **Đánh dấu đã đọc**: Bấm vào một thông báo chưa đọc sẽ đổi màu nền, tắt chấm xanh và gọi API `POST /notifications/:id/read/`.

### 3.2. Tại trang Client (Dự kiến cho `ClientLayout.tsx`)
- Luồng Frontend của Khách hàng sẽ dùng lại exacly component `NotificationDropdown` giống như trang Admin.
- Khách hàng có thể theo dõi xem Admin đã duyệt yêu cầu nạp tiền của mình chưa bằng cách click vào cái Chuông.

---

## 4. KHẢ NĂNG MỞ RỘNG (NẠP TIỀN AUTO CHUẨN)

Nếu sau này dự án muốn nâng cấp từ **Nạp thủ công (Manual)** lên **Nạp tự động hoàn toàn (Auto Deposit)** bằng Bank API (SePay, Casso, Momo API):
1. **Frontend**: Thay vì tạo Form bắt user nhập số tiền để Admin duyệt, Frontend chỉ hiển thị Mã QR chứa cú pháp chuyển khoản (VD: `NAP user123`).
2. **Backend Webhook**: Tạo 1 endpoint `POST /api/webhooks/sepay/` đón data từ Ngân hàng truyền sang.
3. **Xử lý Tự động**: Webhook tự bóc tách chuỗi `user123` -> Cộng số dư -> Sinh `Transaction` -> Gọi hàm `notify_user()` bắn chuông cho user luôn (Quá trình diễn ra trong 2-5 giây, không cần Admin can thiệp).
