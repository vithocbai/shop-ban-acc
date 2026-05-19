web-builder/
│
├── frontend/                         # 🎨 React App (UI + Builder editor)
│   │
│   ├── public/                       # Static assets (favicon, images, icon)
│   │
│   ├── src/                          # 💻 Source chính
│   │   │
│   │   ├── app/                      # ⚙️ Config toàn app (KHÔNG chứa business logic)
│   │   │   ├── router.tsx            # Định nghĩa route (projects, editor...)
│   │   │   ├── providers.tsx         # Wrap context (theme, auth, query client...)
│   │   │   └── store.ts              # Setup global store (Zustand/Redux root)
│   │   │
│   │   ├── features/                 # 🧠 Business modules (quan trọng nhất FE)
│   │   │   │
│   │   │   ├── project/              # 🎯 Quản lý project (CRUD)
│   │   │   │   ├── components/       # UI riêng của project (card, modal...)
│   │   │   │   ├── hooks/            # useProject(), useCreateProject()
│   │   │   │   ├── services/         # call API project
│   │   │   │   ├── store/            # state riêng project
│   │   │   │   └── types.ts          # type TS của project
│   │   │   │
│   │   │   ├── page/                 # 📄 quản lý page trong project
│   │   │   │
│   │   │   ├── builder/              # 🔥 CORE: drag-drop editor
│   │   │   │   ├── components/       # canvas, toolbar, sidebar
│   │   │   │   ├── engine/           # logic builder (tree, node, layout)
│   │   │   │   ├── hooks/            # useBuilder(), useDragDrop()
│   │   │   │   ├── store/            # state editor + undo/redo
│   │   │   │   └── types.ts          # schema JSON component
│   │   │   │
│   │   │   └── auth/                 # 🔐 login/register (nếu có)
│   │   │
│   │   ├── components/               # 🧩 UI dùng chung (reusable)
│   │   │   ├── ui/                   # button, input, modal
│   │   │   └── layout/               # navbar, sidebar layout
│   │   │
│   │   ├── hooks/                   # global hooks (useDebounce, useLocalStorage)
│   │   ├── services/                # axios config + base API
│   │   ├── utils/                   # helper functions
│   │   ├── types/                   # global types
│   │   └── constants/               # config constants
│   │
│   ├── manifest.config.ts           # config extension (nếu build chrome extension)
│   ├── package.json
│   └── .env                         # biến môi trường FE
│
├── backend/                         # ⚙️ Django REST API
│   │
│   ├── config/                      # ⚙️ cấu hình Django
│   │   ├── settings/
│   │   │   ├── base.py              # config chung
│   │   │   ├── dev.py               # config dev
│   │   │   └── prod.py              # config production
│   │   ├── urls.py                  # root API route
│   │   └── wsgi.py
│   │
│   ├── apps/                        # 🧩 business modules (DDD-lite)
│   │   │
│   │   ├── core/                    # 🔥 dùng chung toàn hệ thống
│   │   │   ├── models.py            # BaseModel (created_at, updated_at)
│   │   │   ├── permissions.py       # custom permission
│   │   │   ├── pagination.py        # config pagination
│   │   │   └── utils.py             # helper backend
│   │   │
│   │   ├── project/                 # 🎯 domain project
│   │   │   ├── models.py            # model Project
│   │   │   ├── serializers.py       # convert model <-> JSON
│   │   │   ├── views.py             # API endpoint
│   │   │   ├── urls.py              # route /projects/
│   │   │   ├── services/            # 🔥 business logic (create, clone...)
│   │   │   │   └── project_service.py
│   │   │   ├── selectors/           # 🔥 query DB (lọc, search)
│   │   │   │   └── project_selector.py
│   │   │   └── tests/               # test API
│   │   │
│   │   ├── page/                    # 📄 page trong project
│   │   ├── component/               # 🧩 component config (button, text...)
│   │   ├── builder/                 # 🔥 lưu layout JSON
│   │   └── user/                    # 👤 user system
│   │
│   ├── common/                      # optional (mixins, reusable logic)
│   │
│   ├── manage.py
│   ├── requirements/                # dependency tách theo môi trường
│   │   ├── base.txt
│   │   ├── dev.txt
│   │   └── prod.txt
│   │
│   └── .env                         # biến môi trường backend
│
├── docs/                            # 📚 tài liệu toàn hệ thống (QUAN TRỌNG)
│   ├── ARCHITECTURE.md              # mô tả tổng thể hệ thống
│   ├── API-CONTRACT.md              # định nghĩa API (FE ↔ BE)
│   ├── DATA-SCHEMA.md               # schema DB + JSON builder
│   ├── PRD.md                       # yêu cầu sản phẩm
│   ├── PROJECT-RULES.md             # rule code team
│   │
│   └── flows/                       # 🔥 flow nghiệp vụ
│       ├── builder-flow.md          # kéo thả component
│       ├── undo-redo.md             # logic undo/redo
│       └── save-publish.md          # lưu & publish
│
├── .agents/                         # 🧠 AI agent system
│   ├── rules/                       # rule cho AI
│   ├── skills/                      # kỹ năng AI (generate UI, code...)
│   └── workflows/                   # flow automation
│
├── docker/                          # 🐳 deploy production
│   ├── nginx/                       # reverse proxy
│   ├── backend/                     # docker backend
│   └── frontend/                    # docker frontend
│
├── docker-compose.yml               # chạy full stack local
├── .env                             # env global
└── README.md                        # hướng dẫn project

---

# ARCHITECTURE.md


# 🏗 SYSTEM ARCHITECTURE

Shop bán acc game – ReactJS + Django REST Framework

---

# 1. Tổng Quan Hệ Thống

Hệ thống được xây dựng theo mô hình:

```text id="1u4n5s"
Frontend (ReactJS + TypeScript)
            ↓
REST API (Django REST Framework)
            ↓
Business Services
            ↓
PostgreSQL + Redis + Storage
```

Mục tiêu:

* Quản lý nhiều game
* Dễ scale thêm game mới
* UI hiện đại
* Responsive mobile-first
* Auto delivery account
* Hệ thống admin mạnh
* Tách module rõ ràng
* Dễ maintain & phát triển team

---

# 2. Tech Stack

## Frontend

* ReactJS
* TypeScript
* TailwindCSS v4 (base styling engine)
* **shadcn/ui** (component library – dùng `npx shadcn add`)
* React Router
* Zustand
* React Query
* Axios
* Framer Motion

---

## Backend

* Python 3
* Django
* Django REST Framework
* JWT Authentication

---

## Database

* PostgreSQL

---

## Cache / Queue

* Redis

---

## Upload / Storage

* Cloudflare R2 / AWS S3

---

## Deployment

* Docker
* Docker Compose
* Nginx
* Gunicorn

---

# 3. System Architecture

```text id="93ffvn"
SYSTEM
│
├── Frontend Website
├── Admin Dashboard
├── REST API
├── Authentication System
├── Payment System
├── Account Inventory
├── Order System
├── Notification System
├── Upload System
├── Logging System
└── Analytics System
```

---

# 4. Frontend Architecture

```text id="pdhn6v"
frontend/
│
├── public/
│
├── src/
│   │
│   ├── app/
│   ├── features/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── constants/
│   ├── types/
│   └── styles/
│
├── package.json
└── .env
```

---

# 5. Frontend Modules

# Public Website

```text id="sls2vc"
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
├── Xác nhận hóa đơn
├── Lịch sử mua hàng
├── Tài khoản
└── Đăng nhập / Đăng ký
```

---

## Trang Chủ

Bao gồm:

* banner slider
* game categories
* acc nổi bật
* flash sale
* tin tức
* feedback
* footer

---

## Danh Mục Game

* Liên Quân
* Ngọc Rồng
* hỗ trợ mở rộng game mới

---

## Danh Sách Acc

Chức năng:

* filter
* search realtime
* sort
* pagination

---

## Chi Tiết Acc

Bao gồm:

* gallery ảnh
* thông tin acc
* bảo hành
* nút mua nhanh
* acc liên quan

---

## Giỏ Hàng

* thêm acc
* cập nhật
* xóa acc
* tính tổng tiền

---

## Thanh Toán

Hỗ trợ:

* QR Bank
* Momo
* Thẻ cào
* số dư tài khoản

---

## Tài Khoản Người Dùng

* profile
* đổi mật khẩu
* lịch sử mua
* lịch sử nạp
* wishlist

---

# Admin Dashboard

```text id="0z2b0k"
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

# 6. Backend Architecture

```text id="k93u5x"
backend/
│
├── config/
│   ├── settings/
│   ├── urls.py
│   └── wsgi.py
│
├── apps/
│   │
│   ├── core/
│   │
│   ├── user/
│   │
│   ├── game/
│   │
│   ├── account/
│   │
│   ├── order/
│   │
│   ├── payment/
│   │
│   ├── transaction/
│   │
│   ├── cart/
│   │
│   ├── banner/
│   │
│   ├── news/
│   │
│   ├── notification/
│   │
│   ├── analytics/
│   │
│   ├── upload/
│   │
│   └── system_config/
│
├── common/
├── requirements/
└── manage.py
```

---

# 7. Database Design Philosophy

## Thiết kế chuẩn marketplace nhiều game

Hệ thống KHÔNG tạo bảng riêng cho từng game.

❌ Sai:

```text id="d9c27s"
lienquan_accounts
ngocrong_accounts
```

✅ Đúng:

```text id="0m1v4j"
games
accounts
orders
users
transactions
```

---

# Core Database Tables

## games

```text id="80fw8d"
games
- id
- name
- slug
- icon
- banner
- description
- theme_color
- sort_order
- status
- created_at
- updated_at
```

---

## accounts

```text id="r7vl55"
accounts
- id
- game_id
- title
- slug
- thumbnail
- images
- price
- original_price
- account_code
- status
- account_type
- login_type
- description
- account_data (JSONB)
- sold_at
- created_by
- created_at
- updated_at
```

---

## account_data JSON Example

### Liên Quân

```json id="4zmy89"
{
  "rank": "Cao Thủ",
  "skins": 120,
  "heroes": 95,
  "ngoc": "Full cấp 3"
}
```

---

### Ngọc Rồng

```json id="ml4lm2"
{
  "server": "Vũ Trụ 7",
  "hanh_tinh": "Namek",
  "suc_manh": "15 tỷ",
  "de_tu": true
}
```

---

## users

```text id="f2h79j"
users
- id
- username
- email
- password
- avatar
- phone
- balance
- role
- status
- last_login
- created_at
```

---

## orders

```text id="x2yyk2"
orders
- id
- user_id
- order_code
- total_price
- payment_method
- payment_status
- delivery_status
- note
- created_at
```

---

## order_items

```text id="k4ojar"
order_items
- id
- order_id
- account_id
- price
```

---

## transactions

```text id="1x4fql"
transactions
- id
- user_id
- type
- amount
- status
- transaction_code
- metadata
- created_at
```

---

## banners

```text id="t8w0tk"
banners
- id
- title
- image
- link
- position
- status
```

---

## news

```text id="e5bgmc"
news
- id
- title
- slug
- thumbnail
- content
- author_id
- published_at
```

---

# 8. Authentication System

```text id="dc5vdb"
Login/Register
        ↓
JWT Access Token
        ↓
Refresh Token
        ↓
Protected APIs
```

Role:

* user
* admin
* super_admin

---

# 9. Payment Flow

```text id="rjlwmn"
Checkout
    ↓
Create Transaction
    ↓
Generate QR
    ↓
Webhook Verify
    ↓
Payment Success
    ↓
Auto Delivery
```

---

# 10. Auto Delivery System

```text id="nkgtd4"
Payment Success
    ↓
Lock Account
    ↓
Generate Delivery
    ↓
Send Account Info
    ↓
Mark Sold
```

---

# 11. Account Status

```text id="tmz10u"
AVAILABLE
RESERVED
SOLD
LOCKED
HIDDEN
```

---

# 12. Search & Filtering

Hỗ trợ:

* filter theo game
* giá
* rank
* skin
* server
* login type

Ví dụ API:

```text id="4n1c7f"
/api/accounts/?game=lien-quan&rank=cao-thu
```

---

# 13. Upload System

Upload:

* avatar
* thumbnail
* banner
* gallery ảnh

Flow:

```text id="2vrvh7"
Frontend
    ↓
Upload API
    ↓
Cloud Storage
    ↓
Save URL
```

---

# 14. Cache Strategy

Redis dùng cho:

* homepage cache
* hot accounts
* flash sale
* session cache
* statistics

---

# 15. Security Architecture

## Password

* bcrypt hash

## APIs

* rate limit
* validation
* permission

## Sensitive Data

* encrypt account info

## Admin

* RBAC permission system

---

# 16. Deployment Architecture

```text id="kz0zqx"
Cloudflare
    ↓
Nginx
    ↓
Frontend React App
    ↓
Django REST API
    ↓
PostgreSQL + Redis
```

---

# 17. UI Design Philosophy

# Yêu Cầu Thiết Kế – Shop Acc Game

## Tổng Quan

* Màu trắng chủ đạo
* Giao diện hiện đại
* Sạch sẽ
* Font chữ Roboto
* Button màu #008BFF
* Mobile First
* Responsive toàn bộ
* Dễ mở rộng game mới
* UX tối ưu mua acc nhanh

---

## Tính Năng Chính

| Tính năng           | Mô tả                 |
| ------------------- | --------------------- |
| 🎮 Danh mục game    | Quản lý nhiều game    |
| 🔍 Tìm kiếm & lọc   | Rank, giá, skin       |
| 📋 Chi tiết acc     | Gallery + thông tin   |
| ⚡ Thanh toán nhanh  | QR Bank, Momo         |
| 🤖 Nhận acc tự động | Auto delivery         |
| 🛡 Bảo hành         | Hỗ trợ khách hàng     |
| 👤 Tài khoản        | Lịch sử mua           |
| ⚙️ Admin            | Quản lý toàn hệ thống |

---

# Hệ Màu

| Thành phần     | Màu     |
| -------------- | ------- |
| Background     | #FFFFFF |
| Background phụ | #F9F7FA |
| Border         | #E5E7E9 |
| Primary        | #008BFF |
| Text chính     | #1E293B |
| Text phụ       | #647488 |
| Success        | #10B981 |
| Error          | #EF4444 |

---

# Font Chữ

Roboto

Font weight:

* 300
* 400
* 500
* 600
* 700

---

# UI Components

> ⚡ Dùng **shadcn/ui** làm component library chính. Cài component bằng lệnh: `npx shadcn add <component-name>`

| Component | shadcn/ui package |
| --------- | ----------------- |
| Button | `button` |
| Input | `input` |
| Select | `select` |
| Dialog / Modal | `dialog` |
| Card | `card` |
| Table | `table` |
| Pagination | `pagination` |
| Badge | `badge` |
| Sheet / Drawer | `sheet` |
| Tabs | `tabs` |
| Toast | `sonner` |
| Dropdown Menu | `dropdown-menu` |
| Skeleton | `skeleton` |
| Alert | `alert` |
| Form + Validation | `form` + `react-hook-form` + `zod` |

---

# Responsive Strategy

## Desktop

* sidebar
* multi grid

## Mobile

* bottom navigation
* filter drawer
* sticky CTA

---

# 18. Future Scaling

Hỗ trợ mở rộng:

* thêm game mới
* vòng quay
* random box
* affiliate
* livestream
* app mobile
* AI recommendation

---

# 19. Coding Standards

* strict TypeScript
* modular architecture
* reusable components
* clean code
* atomic design

---

# 20. API Standards

RESTful API:

```text id="ql0fqs"
GET    /api/accounts/
GET    /api/accounts/:id/
POST   /api/orders/
POST   /api/payments/
GET    /api/users/profile/
```

Response format:

```json id="e6v51s"
{
  "success": true,
  "message": "Success",
  "data": {}
}
```
