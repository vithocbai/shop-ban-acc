# flows/builder-flow.md

# 🔥 BUILDER FLOW

Flow hoạt động hệ thống quản lý & render shop acc game

---

# 1. Tổng Quan Flow

Hệ thống hoạt động theo mô hình:

```text id="qv4r2u"
Admin Dashboard
        ↓
Create / Manage Content
        ↓
Backend API
        ↓
Database
        ↓
Frontend Fetch Data
        ↓
Render UI
        ↓
User Interaction
        ↓
Order / Payment / Delivery
```

---

# 2. Main Business Flow

```text id="g7y2jl"
User truy cập website
        ↓
Chọn game
        ↓
Lọc / tìm acc
        ↓
Xem chi tiết acc
        ↓
Thêm giỏ hàng
        ↓
Thanh toán
        ↓
Xác thực giao dịch
        ↓
Auto delivery account
        ↓
Hoàn tất đơn hàng
```

---

# 3. Homepage Flow

# Trang Chủ

## Components

```text id="g4k7k3"
Homepage
│
├── Header
├── Hero Banner
├── Game Categories
├── Featured Accounts
├── Flash Sale
├── News Section
├── Testimonials
└── Footer
```

---

## Data Flow

```text id="ec5m7i"
Frontend Load Homepage
        ↓
Fetch banners
Fetch games
Fetch featured accounts
Fetch flash sale
Fetch news
        ↓
Cache Redis
        ↓
Render UI
```

---

# 4. Game Category Flow

# Danh Mục Game

## Flow

```text id="0mzzxu"
User click game
        ↓
Navigate /games/:slug
        ↓
Fetch game detail
        ↓
Fetch accounts by game
        ↓
Render account list
```

---

# 5. Account Listing Flow

# Danh Sách Acc

## Features

* filter
* search
* sort
* pagination

---

## Flow

```text id="4kzsmv"
User select filters
        ↓
Update query params
        ↓
Call API
        ↓
Backend filtering
        ↓
Return paginated result
        ↓
Render account cards
```

---

# 6. Account Detail Flow

# Chi Tiết Acc

## Flow

```text id="u3w4o0"
User click account
        ↓
Fetch account detail
        ↓
Fetch related accounts
        ↓
Render detail page
```

---

## Data Render

### Main Data

* title
* gallery
* price
* account info
* game data
* warranty

---

### Dynamic Data

Ví dụ:

* rank
* skins
* heroes
* sức mạnh
* server

---

# 7. Cart Flow

# Giỏ Hàng

## Flow

```text id="q7x1pl"
Add to cart
        ↓
Validate account status
        ↓
Save cart item
        ↓
Update cart state
        ↓
Render mini cart
```

---

## Validation

Không cho thêm:

* acc SOLD
* acc LOCKED
* acc RESERVED

---

# 8. Checkout Flow

# Thanh Toán

## Flow

```text id="axd9x8"
User checkout
        ↓
Validate cart
        ↓
Create order
        ↓
Create transaction
        ↓
Generate payment
        ↓
Waiting payment
```

---

# 9. Payment Verification Flow

# Xác Thực Thanh Toán

## QR Banking Flow

```text id="1v3uq7"
Generate QR
        ↓
User transfer
        ↓
Webhook callback
        ↓
Verify amount
        ↓
Payment success
        ↓
Update transaction
```

---

# 10. Auto Delivery Flow

# Tự Động Giao Acc

## Flow

```text id="7m4mq4"
Payment success
        ↓
Lock account
        ↓
Create delivery info
        ↓
Mark account SOLD
        ↓
Send account info
        ↓
Update order status
```

---

## Delivery Data

```text id="c1ax8d"
username
password
email recovery
login note
```

---

# 11. Deposit Flow

# Nạp Tiền

## Flow

```text id="o3efq6"
User chọn nạp tiền
        ↓
Create deposit request
        ↓
Generate QR
        ↓
Webhook verify
        ↓
Update user balance
```

---

# 12. Authentication Flow

# Login/Register

## Login Flow

```text id="k9l2n8"
User login
        ↓
Validate credentials
        ↓
Generate JWT
        ↓
Save tokens
        ↓
Redirect dashboard
```

---

## Register Flow

```text id="pwk4m4"
User register
        ↓
Validate data
        ↓
Create account
        ↓
Send verification
        ↓
Login success
```

---

# 13. User Dashboard Flow

# Tài Khoản Người Dùng

## Features

```text id="6f4e4h"
User Dashboard
│
├── Profile
├── Purchase History
├── Deposit History
├── Wishlist
└── Security
```

---

# 14. Wishlist Flow

# Yêu Thích

## Flow

```text id="lhlj7n"
User favorite account
        ↓
Save wishlist
        ↓
Sync account state
        ↓
Render favorite list
```

---

# 15. News Flow

# Tin Tức

## Flow

```text id="rxhx3j"
Load news list
        ↓
Open article
        ↓
Increase view count
        ↓
Render related posts
```

---

# 16. Notification Flow

# Notifications

## Flow

```text id="jlwmg9"
System event
        ↓
Create notification
        ↓
Push to user
        ↓
Realtime update
```

---

# 17. Admin Dashboard Flow

# Admin Dashboard

## Main Structure

```text id="3wx8x5"
Dashboard
│
├── Accounts
├── Games
├── Orders
├── Users
├── Deposits
├── News
├── Banners
├── Analytics
└── System Settings
```

---

# 18. Admin Account Management Flow

# Quản Lý Acc

## Create Account

```text id="ap78es"
Admin create account
        ↓
Select game
        ↓
Fill dynamic fields
        ↓
Upload images
        ↓
Save account
        ↓
Publish listing
```

---

## Edit Account

```text id="3nq5o4"
Load account
        ↓
Edit fields
        ↓
Validate
        ↓
Update database
```

---

# 19. Dynamic Game Field Flow

# Dynamic Fields

## Backend Structure

```text id="obn5av"
games
        ↓
game_field_configs
        ↓
dynamic form generator
```

---

## Example

### Liên Quân

* rank
* skins
* heroes

---

### Ngọc Rồng

* server
* sức mạnh
* hành tinh

---

# 20. Admin Order Flow

# Quản Lý Đơn Hàng

## Flow

```text id="8cxn6z"
User create order
        ↓
Admin monitoring
        ↓
Payment verify
        ↓
Auto delivery
        ↓
Complete order
```

---

# 21. Admin Deposit Flow

# Quản Lý Nạp Tiền

## Manual Deposit

```text id="8kgh4v"
User upload proof
        ↓
Admin review
        ↓
Approve / Reject
        ↓
Update balance
```

---

# 22. Admin Content Flow

# Quản Lý Nội Dung

## Flow

```text id="v4e4f9"
Admin create banner/news
        ↓
Upload media
        ↓
Publish content
        ↓
Frontend render
```

---

# 23. Search System Flow

# Search Engine

## Flow

```text id="u9s1zi"
User search
        ↓
Debounce input
        ↓
API query
        ↓
Database filtering
        ↓
Return result
```

---

# 24. Filtering System Flow

# Advanced Filters

## Filter Types

* game
* rank
* server
* price
* skins
* heroes

---

## Flow

```text id="1ow4z6"
Apply filters
        ↓
Build query params
        ↓
Backend selectors
        ↓
Paginated results
```

---

# 25. Caching Flow

# Redis Cache

## Cache Targets

```text id="9jsvly"
homepage
featured accounts
flash sale
statistics
game list
```

---

## Flow

```text id="jlwmha"
Request
    ↓
Check cache
    ↓
Hit -> return cache
Miss -> query database
    ↓
Save cache
```

---

# 26. Upload Flow

# Upload System

## Flow

```text id="7u3hsl"
Upload image
        ↓
Validate file
        ↓
Optimize image
        ↓
Upload storage
        ↓
Return URL
```

---

# 27. Security Flow

# Security Layer

## Request Flow

```text id="jlwmhy"
Request
    ↓
JWT Validate
    ↓
Permission Check
    ↓
Rate Limit
    ↓
API Execute
```

---

# 28. Logging Flow

# Audit Logs

## Flow

```text id="3z5hhn"
Admin action
        ↓
Capture changes
        ↓
Save audit log
```

---

# 29. Analytics Flow

# Statistics System

## Track

* revenue
* orders
* top games
* active users

---

## Flow

```text id="jlwmik"
Transaction complete
        ↓
Analytics update
        ↓
Dashboard statistics
```

---

# 30. Future Scaling Flow

# Future Features

## Hỗ trợ mở rộng

```text id="jlwmim"
Random Box
Wheel System
Affiliate
Livestream
AI Recommendation
Mobile App
Realtime Notification
```

---

# 31. Final System Philosophy

# Triết Lý Hệ Thống

Hệ thống phải:

* modular
* scalable
* maintainable
* mobile-first
* realtime-ready
* multi-game ready
* automation-first
* AI-agent friendly
