# 🔌 API CONTRACT

Tài liệu quy định chuẩn giao tiếp API (RESTful) giữa Frontend và Backend cho dự án **Shop bán acc game**.

---

# 1. TỔNG QUAN (Overview)

## Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.domain.com/`

## Headers Mặc Định
Mọi request mang tính chất xác thực đều phải truyền Header sau:
```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

---

# 2. CHUẨN RESPONSE FORMAT (Data Envelope)

Tất cả các API trả về JSON phải bọc trong một `envelope` thống nhất để Frontend dễ dàng bắt lỗi và hiển thị.

## 2.1. Phản Hồi Thành Công (Success)
```json
{
  "success": true,
  "message": "Thông báo thành công (nếu có)",
  "data": {
    "id": 1,
    "name": "Dữ liệu trả về"
  }
}
```

## 2.2. Phản Hồi Lỗi (Error)
```json
{
  "success": false,
  "message": "Mô tả lỗi chính",
  "errors": {
    "email": ["Email đã tồn tại."],
    "password": ["Mật khẩu quá ngắn."]
  }
}
```

## 2.3. Phản Hồi Phân Trang (Pagination)
Chuẩn phân trang áp dụng cho mọi danh sách dữ liệu (Accounts, Orders, Users...).
```json
{
  "success": true,
  "message": "Lấy danh sách thành công",
  "data": {
    "items": [
      { "id": 1, "title": "Acc Liên Quân" }
    ],
    "total": 105,
    "page": 1,
    "page_size": 20
  }
}
```

---

# 3. NHÓM API AUTH & USER

## 3.1. Authentication (Xác thực)
- `POST /auth/login/` - Đăng nhập (Trả về JWT Access/Refresh tokens).
- `POST /auth/register/` - Đăng ký tài khoản.
- `POST /auth/refresh/` - Cấp lại Access Token mới.
- `POST /auth/logout/` - Đăng xuất.

## 3.2. Users (Người dùng)
- `GET /users/profile/` - Lấy thông tin cá nhân hiện tại.
- `PUT /users/profile/` - Cập nhật thông tin (Tên, Số điện thoại...).
- `POST /users/change-password/` - Đổi mật khẩu.

---

# 4. NHÓM API GAME & ACCOUNT

## 4.1. Games (Danh mục Game)
- `GET /games/` - Lấy danh sách tất cả các Game đang hoạt động.
- `GET /games/:slug/` - Lấy chi tiết thông tin và cấu hình (attributes) của một Game.

## 4.2. Accounts (Tài khoản bán)
- `GET /accounts/` - Lấy danh sách Account (Hỗ trợ phân trang, lọc theo `game_id`, `status`, `price_min`, `price_max`).
- `GET /accounts/:id/` - Lấy thông tin chi tiết của 1 Account cụ thể (Bao gồm bộ ảnh gallery và JSON attributes).

---

# 5. NHÓM API ĐƠN HÀNG (Order)

- `POST /orders/create/` - Tạo đơn mua hàng (Thanh toán bằng số dư hoặc chuyển khoản).
- `GET /orders/` - Lấy lịch sử mua hàng cá nhân.
- `GET /orders/:id/` - Xem chi tiết đơn hàng (Giá tiền, trạng thái).
- `GET /orders/:id/delivery/` - Nhận thông tin mật khẩu/tài khoản game (Chỉ có thể gọi khi đơn hàng đã thanh toán thành công).

---

# 6. NHÓM API TÀI CHÍNH (Payment & Transaction)

- `GET /transactions/` - Lịch sử biến động số dư cá nhân (Nạp, Trừ tiền mua acc).
- `POST /deposits/create/` - Tạo yêu cầu nạp tiền (Bank/Momo).
- `GET /deposits/` - Lịch sử các yêu cầu nạp tiền.

---

# 7. NHÓM API DÀNH CHO ADMIN (Yêu cầu Role Admin)

Nhóm API này nằm trong prefix `/admin/` và yêu cầu User phải có Role `ADMIN` hoặc `SUPER_ADMIN`.

## 7.1. Admin Dashboard
- `GET /admin/dashboard/statistics/` - Thống kê tổng số Users, Tổng doanh thu, Đơn hàng mới.

## 7.2. Admin - Quản lý Games
- `GET /admin/games/` - Danh sách toàn bộ Game.
- `POST /admin/games/create/` - Thêm Game mới.
- `PUT /admin/games/:id/` - Cập nhật Game.

## 7.3. Admin - Quản lý Accounts
- `GET /admin/accounts/` - Danh sách Account (Full quyền lọc).
- `POST /admin/accounts/create/` - Đăng bán Account mới (Yêu cầu gửi kèm `account_data` chuẩn JSONB của Game tương ứng).
- `PUT /admin/accounts/:id/` - Cập nhật thông tin Account.
- `DELETE /admin/accounts/:id/` - Xóa/Ẩn Account.

## 7.4. Admin - Quản lý Users
- `GET /admin/users/` - Quản lý danh sách thành viên.
- `POST /admin/users/:id/ban/` - Khóa/Mở khóa tài khoản.
- `POST /admin/users/:id/adjust-balance/` - Cộng/Trừ tiền thủ công.

## 7.5. Admin - Quản lý Đơn hàng & Nạp tiền
- `GET /admin/orders/` - Xem toàn bộ đơn mua hàng.
- `GET /admin/deposits/` - Xem các yêu cầu duyệt tiền.
- `POST /admin/deposits/:id/approve/` - Duyệt cộng tiền cho user.
- `POST /admin/deposits/:id/reject/` - Từ chối yêu cầu nạp.

---

# 8. MÃ TRẠNG THÁI HTTP (HTTP Status Codes)

Hệ thống tuân thủ nghiêm ngặt các HTTP Status Codes sau để Frontend dễ dàng handle Error:

| Code | Ý nghĩa (Meaning)     | Mô tả |
| ---- | --------------------- | ----- |
| 200  | Success               | Xử lý thành công. |
| 201  | Created               | Đã tạo mới tài nguyên thành công. |
| 400  | Bad Request           | Dữ liệu gửi lên không hợp lệ (Validation Error). |
| 401  | Unauthorized          | Thiếu Access Token hoặc Token hết hạn. |
| 403  | Forbidden             | Không có quyền truy cập (Sai Role). |
| 404  | Not Found             | Tài nguyên (ID, Slug) không tồn tại. |
| 500  | Internal Server Error | Lỗi hệ thống backend (Sẽ được log lại). |
