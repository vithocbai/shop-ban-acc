# 🧬 DATA SCHEMA

Tài liệu thiết kế cơ sở dữ liệu cho hệ thống **Shop bán acc game**, được cập nhật chính xác dựa trên cấu trúc DBML của backend.

---

# 1. Database Overview

Hệ thống sử dụng cơ sở dữ liệu quan hệ (PostgreSQL / SQLite) kết hợp cùng kiểu dữ liệu JSON linh hoạt.

- **Không tạo bảng riêng cho từng game**: Toàn bộ tài khoản game được lưu tập trung.
- **Dynamic game data**: Sử dụng trường text/JSON (`account_data`) lưu thông tin đặc thù của mỗi game (rank, skin, vũ trụ...).
- **Chuẩn hóa Django Models**: Tên bảng tự động map theo cấu trúc `app_model` (ví dụ `user_user`, `account_account`).
- Hỗ trợ Soft-delete với trường `deleted_at`.
- Lưu vết thời gian `created_at` và `updated_at` cho các bảng quan trọng.

---

# 2. Entity Relationship (Mô hình quan hệ cốt lõi)

```text
user_user
 ├── auth_group               (Nhóm người dùng - RBAC)
 ├── payment_deposit          (Nạp tiền)
 ├── payment_transaction      (Giao dịch)
 ├── notification_notification (Thông báo)
 ├── order_order              (Đơn hàng)
 │    └── order_orderitem     (Chi tiết đơn hàng)
 │          └── account_account (Tài khoản)
 │                 ├── account_accountimage (Hình ảnh)
 │                 └── game_game            (Danh mục game)
 └── (Sở hữu tài khoản được đăng bán nếu cần)
```

*(Lưu ý: Hệ thống còn bao gồm các bảng built-in của Django như `auth_group`, `auth_permission`, `django_session`, `django_admin_log`, v.v.)*

---

# 3. Chi Tiết Các Bảng Chính (Core Tables)

## 👤 HỆ THỐNG NGƯỜI DÙNG

### `user_user`
Quản lý thông tin tài khoản người dùng và admin.
- `id` (integer) [PK]
- `username`, `email`, `password` (varchar/text)
- `first_name`, `last_name` (varchar)
- `avatar` (text)
- `phone` (varchar)
- `balance` (decimal) - Số dư tài khoản
- `role` (varchar) - Vai trò (VD: USER, ADMIN)
- `status` (varchar) - Trạng thái
- `email_verified`, `is_active`, `is_staff`, `is_superuser` (bool)
- `last_login`, `date_joined`, `created_at`, `updated_at`, `deleted_at` (datetime)
- `groups` [M2M -> auth_group] - Liên kết với Nhóm người dùng

### `auth_group` (Sắp ra mắt - RBAC)
Quản lý các Nhóm người dùng để phục vụ Phân quyền động (VD: Admin, Moderator, CSKH).
- `id` (integer) [PK]
- `name` (varchar) - Tên nhóm người dùng

### `auth_permission` (Sắp ra mắt - RBAC)
Lưu trữ ma trận phân quyền chi tiết (Xem, Thêm, Sửa, Xóa, Xuất dữ liệu) cho từng tính năng.
- `id` (integer) [PK]
- `name` (varchar) - Tên mô tả quyền
- `content_type_id` (integer) - Trỏ đến Module/Bảng dữ liệu
- `codename` (varchar) - Mã quyền (VD: `view_account`, `add_order`)

---

## 🎮 HỆ THỐNG DANH MỤC GAME

### `game_game`
Quản lý danh mục các tựa game (Liên Quân, Ngọc Rồng, Tốc Chiến, v.v.)
- `id` (integer) [PK]
- `name` (varchar) - Tên game
- `slug` (varchar) - Đường dẫn tĩnh
- `icon`, `banner`, `thumbnail` (varchar)
- `description` (text)
- `theme_color` (varchar)
- `sort_order` (integer)
- `is_hot` (bool)
- `status` (varchar)
- `created_at`, `updated_at`, `deleted_at` (datetime)

---

## 📦 HỆ THỐNG KHO TÀI KHOẢN (ACCOUNTS)

### `account_account`
Quản lý tài khoản game đăng bán.
- `id` (integer) [PK]
- `game_id` (bigint) [FK -> game_game.id]
- `created_by_id` (bigint) [FK -> user_user.id]
- `title` (varchar) - Tiêu đề
- `slug` (varchar), `account_code` (varchar) - Mã tài khoản
- `thumbnail` (text)
- `price`, `original_price` (decimal)
- `discount_percent` (integer)
- `status` (varchar) - Trạng thái (VD: AVAILABLE, SOLD, LOCKED)
- `login_type`, `account_type` (varchar)
- `short_description`, `description` (text)
- `account_data` (text) - **Dữ liệu JSON lưu thuộc tính game đặc thù**
- `views` (integer)
- `is_featured`, `is_hot` (bool)
- `sold_at`, `created_at`, `updated_at`, `deleted_at` (datetime)

### `account_accountimage`
Bộ sưu tập ảnh chi tiết (Gallery) của từng tài khoản.
- `id` (integer) [PK]
- `account_id` (bigint) [FK -> account_account.id]
- `image_url` (text)
- `sort_order` (integer)
- `created_at` (datetime)

---

## 🛒 HỆ THỐNG ĐƠN HÀNG

### `order_order`
Quản lý đơn mua hàng của người dùng.
- `id` (integer) [PK]
- `user_id` (bigint) [FK -> user_user.id]
- `order_code` (varchar)
- `total_price` (decimal)
- `payment_status` (varchar)
- `delivery_status` (varchar) - Tình trạng giao acc
- `note` (text)
- `created_at`, `updated_at` (datetime)

### `order_orderitem`
Chi tiết tài khoản trong đơn hàng và dữ liệu nhận acc.
- `id` (integer) [PK]
- `order_id` (bigint) [FK -> order_order.id]
- `account_id` (bigint) [FK -> account_account.id]
- `price` (decimal)
- `delivery_data` (text) - Thông tin đăng nhập acc (mật khẩu) được gửi sau khi thanh toán
- `created_at` (datetime)

---

## 💳 HỆ THỐNG GIAO DỊCH & NẠP TIỀN

### `payment_transaction`
Lịch sử biến động số dư.
- `id` (integer) [PK]
- `user_id` (bigint) [FK -> user_user.id]
- `transaction_code` (varchar)
- `type` (varchar) - Loại giao dịch
- `amount` (decimal)
- `balance_before`, `balance_after` (decimal)
- `payment_method` (varchar)
- `status` (varchar)
- `metadata`, `note` (text)
- `created_at`, `updated_at` (datetime)

### `payment_deposit`
Quản lý các yêu cầu nạp tiền (Bank, Momo, Card).
- `id` (integer) [PK]
- `user_id` (bigint) [FK -> user_user.id]
- `approved_by_id` (bigint) [FK -> user_user.id] - Người duyệt
- `amount` (decimal)
- `method` (varchar)
- `transaction_image` (text) - Hình ảnh bill nạp
- `note`, `admin_note` (text)
- `status` (varchar) - PENDING, APPROVED, REJECTED
- `approved_at`, `created_at`, `updated_at` (datetime)

---

## 🔔 HỆ THỐNG THÔNG BÁO

### `notification_notification`
- `id` (integer) [PK]
- `user_id` (bigint) [FK -> user_user.id]
- `title` (varchar)
- `content` (text)
- `type` (varchar)
- `is_read` (bool)
- `created_at`, `updated_at` (datetime)

---

# 4. Dynamic Game Data (`account_data`)

Trường `account_data` trong `account_account` được dùng để lưu trữ dữ liệu dạng JSON. Tùy thuộc vào game, dữ liệu này sẽ thay đổi:

### Ví dụ: Liên Quân Mobile
```json
{
  "rank": "Cao Thủ",
  "skins": 120,
  "heroes": 95,
  "ngoc": "Full cấp 3",
  "tuong_sss": 12
}
```

### Ví dụ: Ngọc Rồng Online
```json
{
  "server": "Vũ Trụ 7",
  "hanh_tinh": "Namek",
  "suc_manh": "15 tỷ",
  "de_tu": true,
  "bong_tai": true
}
```

---

# 5. Tiêu Chuẩn API Phân Trang (Pagination Standards)

Để đảm bảo đồng nhất giữa Backend và Frontend, tất cả các API lấy danh sách (List APIs) có phân trang phải tuân thủ chuẩn sau:

## Query Parameters
* `page`: Trang hiện tại (1-indexed, mặc định là `1`).
* `page_size`: Số bản ghi trên mỗi trang (mặc định là `10` hoặc `20`).

Ví dụ: `GET /api/accounts/?page=2&page_size=20`

## API Response Format (Standard Envelope)
Tất cả kết quả phân trang trả về từ Backend phải được chuẩn hóa dưới dạng cấu trúc sau:

```json
{
  "success": true,
  "message": "Lấy danh sách thành công",
  "data": {
    "items": [
      // Mảng chứa danh sách các thực thể (ví dụ: danh sách accounts)
    ],
    "total": 105,       // Tổng số bản ghi trên toàn hệ thống
    "page": 2,          // Trang hiện tại
    "page_size": 20     // Số bản ghi mỗi trang
  }
}
```
