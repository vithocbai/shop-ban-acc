# PRD.md

# 📋 PRODUCT REQUIREMENT DOCUMENT

Shop bán acc game – Liên Quân & Ngọc Rồng

---

# 1. Tổng Quan Sản Phẩm

## Tên dự án

Game Account Marketplace

---

## Mục tiêu sản phẩm

Xây dựng nền tảng bán tài khoản game:

* hiện đại
* tự động
* dễ mở rộng
* tối ưu chuyển đổi
* quản lý tập trung

Hệ thống hỗ trợ:

* bán acc game tự động
* nạp tiền
* quản lý người dùng
* quản lý đơn hàng
* dashboard admin
* hỗ trợ nhiều game

---

# 2. Mục Tiêu Kinh Doanh

## Business Goals

### Giai đoạn 1

* Hỗ trợ 2 game:

  * Liên Quân
  * Ngọc Rồng

---

### Giai đoạn 2

Mở rộng:

* Free Fire
* PUBG
* Roblox
* Valorant
* LOL
* TFT

---

### KPI

* xử lý đơn tự động
* giảm support thủ công
* tăng conversion rate
* tối ưu UX mobile
* tăng retention user

---

# 3. Đối Tượng Người Dùng

## User Types

| Vai trò   | Mô tả            |
| --------- | ---------------- |
| Guest     | xem acc          |
| User      | mua acc          |
| Admin     | quản trị         |
| Moderator | quản lý nội dung |

---

# 4. User Problems

## Các vấn đề hiện tại thị trường

### Người mua

* shop thiếu uy tín
* giao acc chậm
* tìm acc khó
* mobile khó dùng
* thanh toán phức tạp

---

### Chủ shop

* quản lý acc thủ công
* thiếu dashboard
* khó scale nhiều game
* xử lý đơn chậm
* không có analytics

---

# 5. Giải Pháp Hệ Thống

## System Solutions

| Problem           | Solution                |
| ----------------- | ----------------------- |
| Tìm acc khó       | Search + Filter         |
| Thanh toán chậm   | QR auto payment         |
| Giao acc thủ công | Auto delivery           |
| Quản lý khó       | Admin dashboard         |
| Khó mở rộng       | Multi-game architecture |

---

# 6. Core Features

# Public Website

```text id="9xfxvl"
Website
│
├── Trang chủ
├── Danh mục game
├── Danh sách acc
├── Chi tiết acc
├── Nạp tiền
├── Tin tức
├── Dịch vụ
├── Giỏ hàng
├── Thanh toán
├── Lịch sử mua
├── Tài khoản
└── Đăng nhập / Đăng ký
```

---

# 7. Trang Chủ

## Mục tiêu

Tăng conversion & trust.

---

## Components

* Header
* Hero banner
* Danh mục game
* Acc nổi bật
* Flash sale
* Tin tức
* Feedback khách hàng
* Footer

---

# 8. Danh Mục Game

## Chức năng

* Hiển thị tất cả game
* Banner từng game
* Số lượng acc
* Điều hướng sang danh sách acc

---

# 9. Danh Sách Acc

## Chức năng

### Search

* theo ID
* theo tên

---

### Filter

* game
* rank
* giá
* server
* skin
* sức mạnh

---

### Sort

* mới nhất
* giá thấp
* giá cao
* nổi bật

---

# 10. Chi Tiết Acc

## Thông tin hiển thị

* gallery ảnh
* giá
* trạng thái
* thông tin game
* thông số acc
* bảo hành
* mô tả
* acc liên quan

---

## CTA

* Mua ngay
* Thêm giỏ hàng
* Yêu thích

---

# 11. Giỏ Hàng

## Chức năng

* thêm acc
* xóa acc
* cập nhật
* tính tổng tiền
* áp voucher

---

# 12. Thanh Toán

## Payment Methods

* QR Bank
* Momo
* Thẻ cào
* Số dư tài khoản

---

## Flow

```text id="59dycs"
Checkout
    ↓
Payment
    ↓
Verify
    ↓
Auto Delivery
```

---

# 13. Auto Delivery

## Sau thanh toán

Hệ thống:

* khóa acc
* tạo đơn hàng
* gửi thông tin acc
* đánh dấu SOLD

---

# 14. Người Dùng

## User Features

### Profile

* avatar
* username
* email
* số dư

---

### Quản lý

* đổi mật khẩu
* lịch sử mua
* lịch sử nạp
* acc yêu thích

---

# 15. Tin Tức

## News Features

* danh sách bài viết
* chi tiết bài viết
* SEO friendly
* related posts

---

# 16. Dịch Vụ

## Services

* cày thuê
* nạp game
* nâng cấp acc
* hỗ trợ kỹ thuật

---

# 17. Notification System

## Hệ thống thông báo

* thanh toán thành công
* đơn hàng
* khuyến mãi
* thông báo hệ thống

---

# 18. Admin Dashboard

```text id="jlwmg2"
Admin Dashboard
│
├── Quản lý tài khoản
│   ├── Tài khoản game
│   └── Danh mục game
│
├── Quản lý đơn hàng
│   ├── Danh sách đơn hàng
│   └── Lịch sử giao dịch
│
├── Quản lý người dùng
│   ├── Danh sách người dùng
│   ├── Phân quyền
│   └── Nhóm người dùng
│
├── Quản lý nạp tiền
│   ├── Nạp tiền thủ công
│   ├── Thẻ nạp
│   └── Lịch sử nạp tiền
│
├── Quản lý nội dung
│   ├── Tin tức
│   ├── Banner
│   └── Thông báo hệ thống
│
├── Cấu hình hệ thống
│   ├── Cài đặt chung
│   ├── Cài đặt thanh toán
│   ├── Cài đặt bảo mật
│   └── Nhật ký hệ thống
│
└── Báo cáo thống kê
```

---

# 19. Admin – Quản Lý Tài Khoản

## Chức năng

### Account CRUD

* tạo acc
* sửa acc
* xóa acc
* lock acc

---

### Upload

* thumbnail
* gallery
* thông tin acc

---

### Dynamic Fields

Theo từng game:

* Liên Quân
* Ngọc Rồng
* game tương lai

---

# 20. Admin – Quản Lý Đơn Hàng

## Chức năng

* danh sách đơn
* trạng thái đơn
* delivery info
* hoàn tiền
* transaction logs

---

# 21. Admin – Quản Lý Người Dùng

## Chức năng

* xem user
* khóa tài khoản
* phân quyền
* quản lý số dư

---

# 22. Admin – Quản Lý Nạp Tiền

## Chức năng

* duyệt nạp
* lịch sử giao dịch
* cấu hình QR
* webhook payment

---

# 23. Admin – Quản Lý Nội Dung

## Bao gồm

* banner
* popup
* bài viết
* thông báo

---

# 24. Admin – Báo Cáo

## Analytics

* doanh thu
* đơn hàng
* top game
* top user
* tăng trưởng

---

# 25. Mobile First Requirement

## Ưu tiên mobile

Vì phần lớn user:

* truy cập bằng điện thoại
* thanh toán mobile

---

## Mobile UX

* sticky CTA
* bottom navigation
* filter drawer
* responsive grid

---

# 26. UI/UX Design Requirements

# Thiết Kế

## Tổng Quan

* màu trắng chủ đạo
* hiện đại
* tối giản
* gaming nhẹ
* không rối mắt

---

## Typography

### Font

Roboto

### Font Weight

* 300
* 400
* 500
* 600
* 700

---

## Color System

| Thành phần | Màu | Lớp CSS (Tailwind) | Dùng cho |
| ----------------- | ------- | -------------------- | ------------------------------ |
| Primary | #000000 | `bg-primary` | Nút bấm chính, tông chủ đạo đen|
| Primary Hover | #1a1a1a | `hover:bg-primary-hover`| Di chuột nút bấm chính |
| Background | #FFFFFF | `bg-bg-main` | Nền chính trắng tinh khiết |
| Secondary BG | #FAFAFA | `bg-bg-secondary` | Nền phụ xám tinh khiết cực nhạt |
| Border | #E5E7E9 | `border-border-color`| Màu đường viền khung |
| Text Primary | #1E293B | `text-text-main` | Chữ chính |
| Text Secondary | #647488 | `text-text-secondary`| Chữ chú thích, chữ phụ |
| Success | #10B981 | `text-success` | Trạng thái thành công |
| Error | #EF4444 | `text-error` | Trạng thái lỗi |

---

## Components

> Dùng **shadcn/ui** cho tất cả UI component. Cài bằng `npx shadcn add <name>`:

| Component | shadcn/ui |
| --------- | --------- |
| Button | `button` |
| Card | `card` |
| Dialog/Modal | `dialog` |
| Input | `input` |
| Select | `select` |
| Sidebar | `sidebar` |
| Table | `table` |
| Sheet/Drawer | `sheet` |
| Tabs | `tabs` |
| Toast | `sonner` |

---

# 27. Performance Requirements

## Target

* Lighthouse > 90
* load < 3s
* responsive realtime
* lazy loading images

---

# 28. SEO Requirements

## SEO Features

* dynamic meta
* sitemap
* robots.txt
* slug friendly
* SSR compatible future

---

# 29. Security Requirements

## Security

* JWT auth
* rate limit
* anti spam
* encrypt account info
* RBAC admin

---

# 30. Future Roadmap

## Future Features

* vòng quay
* random box
* affiliate system
* livestream
* AI recommendation
* mobile app
* realtime notification

---

# 31. Technical Stack

## Frontend

* ReactJS
* TypeScript
* TailwindCSS v4
* **shadcn/ui**
* Zustand
* React Query

---

## Backend

* Django
* Django REST Framework
* PostgreSQL
* Redis

---

## Deploy

* Docker
* Nginx
* Cloudflare

---

# 32. Success Metrics

## KPIs

* conversion rate
* repeat purchase
* DAU
* retention
* average order value
* support reduction

---

# 33. Final Goals

Hệ thống cần:

* dễ scale
* dễ maintain
* tối ưu UX
* tối ưu admin
* hỗ trợ multi-game
* tự động hóa tối đa
