# DATA-SCHEMA.md

# 🧬 DATA SCHEMA

Shop bán acc game – PostgreSQL Database Schema

---

# 1. Database Overview

Hệ thống sử dụng:

* PostgreSQL
* JSONB dynamic attributes
* chuẩn scalable marketplace
* hỗ trợ nhiều game
* dễ mở rộng

---

# 2. Database Design Principles

## Core Principles

* Không tạo bảng riêng cho từng game
* Một bảng account chung
* Dynamic game data bằng JSONB
* Soft delete
* Audit timestamps
* UUID hoặc BIGINT id
* Chuẩn normalize

---

# 3. Entity Relationship Overview

```text id="g4a7ga"
users
 ├── orders
 │    └── order_items
 │          └── accounts
 │                 └── games
 │
 ├── transactions
 ├── notifications
 └── user_roles
```

---

# 4. Core Tables

# USERS

## users

```sql id="5szqtr"
users
- id BIGSERIAL PRIMARY KEY
- username VARCHAR(50)
- email VARCHAR(255) UNIQUE
- password VARCHAR(255)
- avatar TEXT
- phone VARCHAR(20)
- balance DECIMAL(18,2)
- role VARCHAR(30)
- status VARCHAR(20)
- email_verified BOOLEAN
- last_login TIMESTAMP
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

---

## User Status

```text id="kt1tnx"
ACTIVE
BANNED
PENDING
```

---

## User Roles

```text id="58lj6d"
USER
ADMIN
SUPER_ADMIN
MODERATOR
```

---

# GAMES

## games

```sql id="qslrpd"
games
- id BIGSERIAL PRIMARY KEY
- name VARCHAR(100)
- slug VARCHAR(100) UNIQUE
- icon TEXT
- banner TEXT
- thumbnail TEXT
- description TEXT
- theme_color VARCHAR(20)
- sort_order INTEGER
- is_hot BOOLEAN
- status VARCHAR(20)
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

---

## Game Status

```text id="5q4ld9"
ACTIVE
HIDDEN
MAINTENANCE
```

---

# ACCOUNTS

## accounts

```sql id="7hjf6n"
accounts
- id BIGSERIAL PRIMARY KEY
- game_id BIGINT
- title VARCHAR(255)
- slug VARCHAR(255)
- account_code VARCHAR(50)
- thumbnail TEXT
- price DECIMAL(18,2)
- original_price DECIMAL(18,2)
- discount_percent INTEGER
- status VARCHAR(20)
- login_type VARCHAR(50)
- account_type VARCHAR(50)
- short_description TEXT
- description TEXT
- account_data JSONB
- sold_at TIMESTAMP
- is_featured BOOLEAN
- is_hot BOOLEAN
- views INTEGER
- created_by BIGINT
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

---

# 5. Dynamic Game Data

## account_data JSONB

## Liên Quân Example

```json id="f2v78u"
{
  "rank": "Cao Thủ",
  "skins": 120,
  "heroes": 95,
  "ngoc": "Full cấp 3",
  "tuong_sss": 12
}
```

---

## Ngọc Rồng Example

```json id="azq8fj"
{
  "server": "Vũ Trụ 7",
  "hanh_tinh": "Namek",
  "suc_manh": "15 tỷ",
  "de_tu": true,
  "bong_tai": true
}
```

---

# 6. Account Gallery

## account_images

```sql id="q1suwv"
account_images
- id BIGSERIAL PRIMARY KEY
- account_id BIGINT
- image_url TEXT
- sort_order INTEGER
- created_at TIMESTAMP
```

---

# 7. Account Status

```text id="8ynfwj"
AVAILABLE
RESERVED
SOLD
LOCKED
HIDDEN
```

---

# 8. Orders

## orders

```sql id="w7pm1u"
orders
- id BIGSERIAL PRIMARY KEY
- user_id BIGINT
- order_code VARCHAR(50)
- total_price DECIMAL(18,2)
- payment_method VARCHAR(50)
- payment_status VARCHAR(20)
- delivery_status VARCHAR(20)
- note TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

---

## order_items

```sql id="3vok61"
order_items
- id BIGSERIAL PRIMARY KEY
- order_id BIGINT
- account_id BIGINT
- price DECIMAL(18,2)
- created_at TIMESTAMP
```

---

# 9. Payment System

## transactions

```sql id="ct4cwy"
transactions
- id BIGSERIAL PRIMARY KEY
- user_id BIGINT
- transaction_code VARCHAR(50)
- type VARCHAR(50)
- amount DECIMAL(18,2)
- payment_method VARCHAR(50)
- status VARCHAR(20)
- metadata JSONB
- created_at TIMESTAMP
```

---

## Transaction Types

```text id="4lx8ux"
DEPOSIT
PURCHASE
REFUND
WITHDRAW
```

---

## Transaction Status

```text id="nnv4mr"
PENDING
SUCCESS
FAILED
CANCELLED
```

---

# 10. Cart System

## carts

```sql id="3v6sw9"
carts
- id BIGSERIAL PRIMARY KEY
- user_id BIGINT
- created_at TIMESTAMP
```

---

## cart_items

```sql id="3w0h4f"
cart_items
- id BIGSERIAL PRIMARY KEY
- cart_id BIGINT
- account_id BIGINT
- created_at TIMESTAMP
```

---

# 11. Notifications

## notifications

```sql id="hj1w6m"
notifications
- id BIGSERIAL PRIMARY KEY
- user_id BIGINT
- title VARCHAR(255)
- content TEXT
- type VARCHAR(50)
- is_read BOOLEAN
- created_at TIMESTAMP
```

---

# 12. News System

## news

```sql id="nztu0w"
news
- id BIGSERIAL PRIMARY KEY
- title VARCHAR(255)
- slug VARCHAR(255)
- thumbnail TEXT
- content TEXT
- author_id BIGINT
- views INTEGER
- published_at TIMESTAMP
- created_at TIMESTAMP
```

---

# 13. Banner System

## banners

```sql id="z7f2z4"
banners
- id BIGSERIAL PRIMARY KEY
- title VARCHAR(255)
- image_url TEXT
- redirect_url TEXT
- position VARCHAR(50)
- sort_order INTEGER
- status VARCHAR(20)
- created_at TIMESTAMP
```

---

# 14. Deposit System

## deposits

```sql id="mmbn3g"
deposits
- id BIGSERIAL PRIMARY KEY
- user_id BIGINT
- amount DECIMAL(18,2)
- method VARCHAR(50)
- transaction_image TEXT
- note TEXT
- status VARCHAR(20)
- approved_by BIGINT
- approved_at TIMESTAMP
- created_at TIMESTAMP
```

---

# 15. Roles & Permissions

## roles

```sql id="wmuq71"
roles
- id BIGSERIAL PRIMARY KEY
- name VARCHAR(50)
- description TEXT
```

---

## permissions

```sql id="t5q8m7"
permissions
- id BIGSERIAL PRIMARY KEY
- key VARCHAR(100)
- description TEXT
```

---

## role_permissions

```sql id="c9e6oe"
role_permissions
- role_id BIGINT
- permission_id BIGINT
```

---

# 16. Audit Logs

## audit_logs

```sql id="nd53r9"
audit_logs
- id BIGSERIAL PRIMARY KEY
- user_id BIGINT
- action VARCHAR(255)
- target_type VARCHAR(100)
- target_id BIGINT
- old_data JSONB
- new_data JSONB
- created_at TIMESTAMP
```

---

# 17. System Settings

## system_settings

```sql id="hylj3m"
system_settings
- id BIGSERIAL PRIMARY KEY
- key VARCHAR(100)
- value TEXT
- updated_at TIMESTAMP
```

---

# 18. Voucher System

## vouchers

```sql id="4nn1kg"
vouchers
- id BIGSERIAL PRIMARY KEY
- code VARCHAR(50)
- discount_type VARCHAR(20)
- discount_value DECIMAL(18,2)
- max_usage INTEGER
- used_count INTEGER
- expired_at TIMESTAMP
- created_at TIMESTAMP
```

---

# 19. Wishlist System

## wishlists

```sql id="rz3mij"
wishlists
- id BIGSERIAL PRIMARY KEY
- user_id BIGINT
- account_id BIGINT
- created_at TIMESTAMP
```

---

# 20. Flash Sale System

## flash_sales

```sql id="zjohf9"
flash_sales
- id BIGSERIAL PRIMARY KEY
- title VARCHAR(255)
- start_time TIMESTAMP
- end_time TIMESTAMP
- status VARCHAR(20)
```

---

## flash_sale_items

```sql id="d5lj5n"
flash_sale_items
- id BIGSERIAL PRIMARY KEY
- flash_sale_id BIGINT
- account_id BIGINT
- sale_price DECIMAL(18,2)
```

---

# 21. Support Tickets

## support_tickets

```sql id="5ggt7o"
support_tickets
- id BIGSERIAL PRIMARY KEY
- user_id BIGINT
- subject VARCHAR(255)
- content TEXT
- status VARCHAR(20)
- created_at TIMESTAMP
```

---

# 22. SEO System

## seo_meta

```sql id="7h4iws"
seo_meta
- id BIGSERIAL PRIMARY KEY
- entity_type VARCHAR(50)
- entity_id BIGINT
- meta_title VARCHAR(255)
- meta_description TEXT
- meta_keywords TEXT
```

---

# 23. Indexing Strategy

## Important Indexes

```sql id="xq5tux"
INDEX accounts(game_id)
INDEX accounts(status)
INDEX accounts(price)
INDEX orders(user_id)
INDEX transactions(user_id)
INDEX news(slug)
```

---

# 24. Relationship Summary

## Main Relationships

```text id="6tw0kj"
users
 ├── orders
 ├── transactions
 ├── notifications
 ├── carts
 └── wishlists

games
 └── accounts

orders
 └── order_items

accounts
 ├── account_images
 └── wishlists
```

---

# 25. Soft Delete Strategy

Các bảng quan trọng nên hỗ trợ:

```sql id="s1cb37"
deleted_at TIMESTAMP NULL
```

Áp dụng:

* users
* accounts
* games
* news

---

# 26. Timestamp Convention

Mọi bảng đều nên có:

```sql id="8w7jry"
created_at
updated_at
```

---

# 27. Security Notes

## Không lưu plain text

Thông tin acc game:

* encrypt password
* encrypt email recovery
* decrypt khi delivery

---

## Sensitive Fields

```text id="dqkhqe"
account_password
email_recovery
otp_backup
```

---

# 28. Scaling Strategy

Hệ thống hỗ trợ:

* thêm game mới
* hàng triệu account
* caching
* analytics
* microservice future

---

# 29. Recommended PostgreSQL Features

Sử dụng:

* JSONB
* GIN Index
* Full Text Search
* Partitioning
* Materialized Views

---

# 30. Future Extensions

Dễ mở rộng:

* random box
* vòng quay
* affiliate
* livestream
* AI recommendations
* mobile app
