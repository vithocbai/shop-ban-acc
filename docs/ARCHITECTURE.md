# 🏗 SYSTEM ARCHITECTURE

Shop bán acc game – ReactJS + Django REST Framework

---

# 1. Tổng Quan Hệ Thống

Hệ thống được xây dựng theo mô hình:

```text
Frontend (ReactJS + TypeScript)
            ↓
REST API (Django REST Framework)
            ↓
Business Services
            ↓
PostgreSQL + Redis + Storage
```

Mục tiêu:
- Quản lý nhiều game.
- Dễ scale thêm game mới.
- Giao diện UI hiện đại, quản trị dễ dàng.
- Responsive mobile-first.
- Auto delivery account (Giao acc tự động).
- Hệ thống admin mạnh mẽ.
- Tách module rõ ràng, dễ maintain.

---

# 2. Tech Stack

## Frontend
- **Core**: ReactJS (v19), TypeScript, Vite
- **Styling**: TailwindCSS v4, Class Variance Authority, clsx, tailwind-merge
- **UI Components**: shadcn/ui, Radix UI, lucide-react
- **Routing**: React Router v7
- **State/Data Fetching**: (Dự kiến) Zustand, React Query
- **HTTP Client**: Axios
- **Notifications**: react-toastify

## Backend
- **Core**: Python, Django
- **API**: Django REST Framework
- **Authentication**: JWT Authentication
- **Database**: PostgreSQL (Development hiện dùng SQLite: db.sqlite3)

## Khác (Deployment & Tools)
- Docker, Docker Compose
- Redis (Dự kiến cho Cache/Queue)
- Nginx / Gunicorn (Cho Production)

---

# 3. System Architecture

```text
SYSTEM
│
├── Frontend Website (Public & Auth)
├── Admin Dashboard (Quản trị hệ thống)
├── REST API (Backend Django)
├── Authentication System
├── Payment System (Nạp tiền, thanh toán)
├── Account Inventory (Kho acc)
├── Order & Cart System (Đơn hàng, Giỏ hàng)
├── Notification System (Thông báo)
├── Upload System (Quản lý file)
└── Analytics System (Báo cáo thống kê)
```

---

# 4. Folder Structure

Cấu trúc dự án theo hướng phân chia frontend/backend tách biệt.

```text
shop-game/ (web-builder/)
│
├── frontend/                            # 🎨 React App
│   ├── public/                          # Static assets
│   ├── src/                             # 💻 Source chính
│   │   ├── app/                         # Cấu hình app chung
│   │   ├── assets/                      # Hình ảnh, font
│   │   ├── components/                  # UI Components dùng chung (shadcn/ui, layout...)
│   │   ├── constants/                   # Hằng số toàn cục
│   │   ├── context/                     # React Context (AuthContext...)
│   │   ├── features/                    # 🧠 Business modules (Domain-driven)
│   │   │   ├── account/                 # Quản lý tài khoản game
│   │   │   ├── auth/                    # Xác thực người dùng
│   │   │   ├── game/                    # Quản lý danh mục game
│   │   │   ├── order/                   # Quản lý đơn hàng
│   │   │   └── user/                    # Quản lý thông tin người dùng
│   │   ├── hooks/                       # Custom hooks
│   │   ├── lib/                         # Thư viện (utils của tailwind, shadcn)
│   │   ├── pages/                       # Component cho từng trang (Admin, Auth...)
│   │   ├── services/                    # Axios config, gọi API
│   │   ├── types/                       # TypeScript types
│   │   └── utils/                       # Hàm helper
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                             # ⚙️ Django REST API
│   ├── config/                          # Cấu hình core Django (settings, urls, wsgi)
│   ├── apps/                            # 🧩 Business modules
│   │   ├── core/                        # Base models, utils dùng chung
│   │   ├── account/                     # Quản lý tài khoản game bán
│   │   ├── analytics/                   # Thống kê, báo cáo
│   │   ├── banner/                      # Quản lý banner quảng cáo
│   │   ├── cart/                        # Quản giỏ hàng
│   │   ├── game/                        # Quản lý danh mục game
│   │   ├── news/                        # Tin tức, bài viết
│   │   ├── notification/                # Thông báo hệ thống
│   │   ├── order/                       # Quản lý đơn hàng
│   │   ├── payment/                     # Tích hợp thanh toán
│   │   ├── system_config/               # Cấu hình hệ thống (Settings admin)
│   │   ├── transaction/                 # Quản lý giao dịch nạp/trừ tiền
│   │   ├── upload/                      # Upload file/ảnh
│   │   └── user/                        # Xác thực và quản lý User/Admin
│   ├── requirements.txt                 # Dependencies
│   └── manage.py
│
├── docker/                              # 🐳 Cấu hình Docker cho deploy
├── docs/                                # 📚 Tài liệu dự án
└── docker-compose.yml                   # Môi trường chạy local bằng Docker
```

---

# 5. Frontend Modules

## Public Website
- Trang chủ (Banner, Game categories, Acc nổi bật, Flash sale, Tin tức)
- Danh mục game (Liên Quân, Ngọc Rồng...)
- Danh sách acc (Tìm kiếm, Lọc, Phân trang)
- Chi tiết acc (Gallery ảnh, thông tin acc, bảo hành)
- Giỏ hàng & Thanh toán
- Tài khoản người dùng (Profile, Đổi mật khẩu, Lịch sử mua/nạp)
- Đăng nhập / Đăng ký

## Admin Dashboard
- **Dashboard**: Thống kê doanh thu, số đơn, người dùng.
- **Quản lý Game**: Thêm/sửa/xóa game, cấu hình category.
- **Quản lý Tài khoản (Acc)**: Thêm acc, định giá, trạng thái.
- **Quản lý Đơn hàng**: Theo dõi lịch sử mua hàng, xử lý khiếu nại.
- **Quản lý Nạp tiền / Giao dịch**: Theo dõi nạp tiền, nạp thủ công.
- **Quản lý Người dùng**: Phân quyền, khóa/mở tài khoản.

---

# 6. Database Design Philosophy

Hệ thống thiết kế theo chuẩn marketplace nhiều game. **Không tạo bảng riêng cho từng game.**

❌ **Sai**: `lienquan_accounts`, `ngocrong_accounts`
✅ **Đúng**: `games`, `accounts`, `orders`, `users`

## Core Entities
- **games**: id, name, slug, icon, status, ...
- **accounts**: id, game_id, title, price, account_code, status, account_data (JSONB lưu trữ thông tin đặc thù theo từng game).
- **users**: id, username, email, password, role, balance, status.
- **orders**: id, user_id, order_code, total_price, payment_status, delivery_status.
- **order_items**: id, order_id, account_id, price.
- **transactions**: id, user_id, type (nạp/rút), amount, status.

*(Chi tiết xem thêm ở `DATA-SCHEMA.md` hoặc `schema.dbml`)*

---

# 7. Flow Cơ Bản

## Authentication System
- Hỗ trợ Role: `user`, `admin`, `super_admin`.
- Dùng JWT (Access Token & Refresh Token) cho mọi request yêu cầu xác thực.

## Payment & Auto Delivery
1. Người dùng chọn tài khoản -> Checkout (Bằng số dư hoặc Cổng thanh toán/QR).
2. Hệ thống kiểm tra số dư / Nhận Webhook xác nhận.
3. Thanh toán thành công -> Khóa Account (đổi trạng thái `SOLD`).
4. Tự động trả thông tin đăng nhập Account (Delivery) cho người dùng trong Chi tiết đơn hàng.

## Upload System
- Avatar, Thumbnail, Banner, Gallery ảnh.
- Frontend gọi Upload API -> Backend lưu trữ (Local Storage / S3 / Cloudflare R2) -> Trả về URL.

---

# 8. UI/UX Design & Coding Standards

- Nền chủ đạo: Sạch sẽ, hiện đại, tối giản.
- Khung UI xây dựng từ **shadcn/ui**, dùng CSS variables để tùy biến màu (Tránh hardcode mã hex).
- Phân trang chuẩn: Sử dụng `Pagination` và `Select` (Rows per page) của shadcn.
- **Responsive**: Mobile-first cho Frontend Website. Admin Dashboard tập trung tối ưu cho Desktop/Tablet.
- **TypeScript**: Bắt buộc strict type.
- **Cấu trúc**: Tuân thủ Domain-Driven Design (phân chia theo `features/` bên Frontend và `apps/` bên Backend).
