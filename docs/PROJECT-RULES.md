# PROJECT-RULES.md

# 📜 PROJECT RULES

Shop bán acc game – Development Standards & Team Conventions

---

# 1. Mục Tiêu Tài Liệu

Tài liệu này định nghĩa:

* coding standards
* kiến trúc project
* quy tắc teamwork
* convention frontend/backend
* quy tắc Git
* quy tắc UI/UX
* performance & security rules

Mục tiêu:

* code clean
* dễ maintain
* dễ scale
* onboarding nhanh
* AI agent friendly

---

# 2. Core Principles

## Quy tắc cốt lõi

### 1. Modular Architecture

Mọi tính năng phải tách module rõ ràng.

---

### 2. Reusable Components

Không duplicate UI/component.

---

### 3. Scalable First

Thiết kế để dễ mở rộng nhiều game.

---

### 4. Mobile First

UI ưu tiên mobile trước desktop.

---

### 5. Clean Code

Code dễ đọc > code “thông minh”.

---

### 6. Business Logic Separation

Không viết business logic trong UI.

---

# 3. Frontend Rules

# Frontend Stack

* ReactJS
* TypeScript
* TailwindCSS v4 (base styling engine)
* **shadcn/ui** (component library – `npx shadcn add <component>`)
* Zustand
* React Query
* Axios

---

# 4. Frontend Folder Rules

## Rule

### ❌ Không được

```text id="wdr1y5"
src/components/pages/home.tsx
```

---

### ✅ Đúng

```text id="i6g8kg"
src/features/home/
```

---

# 5. Feature-based Architecture

## Structure

```text id="n7n5f7"
features/
└── account/
    ├── components/
    ├── hooks/
    ├── services/
    ├── store/
    ├── types.ts
    └── pages/
```

---

# 6. Component Rules

## Component Types

| Type    | Purpose           |
| ------- | ----------------- |
| ui      | reusable          |
| shared  | dùng nhiều module |
| feature | riêng business    |
| layout  | layout app        |

---

# 7. React Rules

## Component Naming

### ✅ Đúng

```tsx id="9apvij"
AccountCard.tsx
AccountFilter.tsx
```

---

### ❌ Sai

```tsx id="jk6zzn"
card.tsx
filter.tsx
```

---

# 8. TypeScript Rules

## Strict TypeScript

### ❌ Không dùng

```ts id="rv6r2v"
any
```

---

### ✅ Phải dùng

```ts id="9m4g2o"
interface
type
enum
```

---

# 9. State Management Rules

## Zustand dùng cho:

* auth state
* cart state
* UI state

---

## React Query dùng cho:

* API cache
* async data
* pagination
* mutation

---

# 10. API Rules

## Không gọi API trực tiếp trong component

### ❌ Sai

```tsx id="syo9g6"
axios.get(...)
```

---

### ✅ Đúng

```tsx id="wmr0t8"
services/account.service.ts
```

---

# 11. Styling Rules

## Component Library: shadcn/ui

* Dùng **shadcn/ui** làm component library chính (Button, Input, Dialog, Table, Card...).
* Cài component bằng: `npx shadcn add <tên-component>`
* **TailwindCSS** vẫn là nền tảng – dùng Tailwind class để custom/điều chỉnh thêm khi cần.

---

## ❌ Không dùng:

* inline style
* bootstrap
* material ui
* ant design
* hành vi viết thủ công những component đã có trong shadcn/ui

---

# 12. Tailwind Rules

## Quy tắc

### ❌ Không viết class quá dài

---

### ✅ Tách reusable class

```tsx id="yjvqgs"
const buttonClass = ""
```

---

# 13. UI Design Rules

# Thiết Kế Tổng Quan

## Theme

* trắng chủ đạo
* hiện đại
* gaming nhẹ
* tối giản
* sạch sẽ

---

## Font

Roboto

---

## Primary Color

```text id="4wt0vz"
#008BFF
```

---

## Border Radius

```text id="jl6gc4"
rounded-xl
rounded-2xl
```

---

## Shadow

```text id="uc4l5w"
shadow-sm
shadow-md
```

---

# 14. Responsive Rules

## Breakpoints

| Device  | Width  |
| ------- | ------ |
| Mobile  | <768px |
| Tablet  | 768px  |
| Desktop | 1280px |

---

## Mobile First

Luôn code:

```text id="6wl4it"
mobile -> tablet -> desktop
```

---

# 15. Naming Convention

# Frontend

## File Naming

```text id="yb3x3t"
PascalCase.tsx
camelCase.ts
kebab-case.css
```

---

# Backend

## API Naming

```text id="33f7o1"
/api/accounts/
/api/orders/
```

---

# Database

## Table Naming

```text id="g0slw7"
snake_case
plural_table_name
```

---

# 16. Backend Rules

# Backend Stack

* Django
* Django REST Framework
* PostgreSQL
* Redis

---

# 17. Django App Rules

## Structure

```text id="51l7ud"
apps/
└── account/
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── services/
    ├── selectors/
    └── tests/
```

---

# 18. Business Logic Rules

## ❌ Không viết business logic trong:

* views.py
* serializers.py

---

## ✅ Business logic phải nằm:

* services/

---

# 19. Selector Rules

## Query DB phải nằm:

* selectors/

---

## Ví dụ

```text id="e0n3qj"
account_selector.py
order_selector.py
```

---

# 20. Database Rules

## Không tạo bảng riêng từng game

### ❌ Sai

```text id="0ybjmo"
lienquan_accounts
ngocrong_accounts
```

---

### ✅ Đúng

```text id="1yb1jv"
accounts
games
```

---

# 21. JSONB Rules

## Dynamic game data

```json id="jgpm0w"
{
  "rank": "Cao Thủ",
  "skins": 120
}
```

---

# 22. API Response Rules

## Success Response

```json id="a3a8tt"
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

## Error Response

```json id="t2f7tb"
{
  "success": false,
  "message": "Validation Error",
  "errors": {}
}
```

---

# 23. Authentication Rules

## Auth Method

* JWT Authentication

---

## Role System

```text id="dpk5cq"
USER
ADMIN
SUPER_ADMIN
MODERATOR
```

---

# 24. Permission Rules

## Admin APIs phải check:

* authentication
* permission
* role

---

# 25. Security Rules

## Không log:

* password
* token
* account credentials

---

## Encrypt:

* account password
* recovery email
* sensitive data

---

# 26. Git Rules

# Branch Naming

## Feature

```text id="ndydt9"
feature/account-filter
```

---

## Fix

```text id="u5s07l"
fix/payment-bug
```

---

## Refactor

```text id="7hbd5d"
refactor/order-service
```

---

# 27. Commit Convention

## Format

```text id="2kmb9u"
type(scope): message
```

---

## Examples

```text id="4b9mr8"
feat(account): add account filter
fix(payment): momo callback issue
refactor(order): optimize query
```

---

# 28. Pull Request Rules

## PR phải:

* clear description
* screenshot UI
* explain changes
* no conflict

---

# 29. Code Review Rules

## Review Checklist

* clean code
* responsive
* reusable
* no duplicate
* performance
* security

---

# 30. Performance Rules

## Frontend

* lazy loading
* code splitting
* memoization
* image optimization

---

## Backend

* select_related
* prefetch_related
* caching
* indexing

---

# 31. Caching Rules

## Redis dùng cho:

* homepage
* flash sale
* statistics
* hot accounts

---

# 32. Upload Rules

## File Upload

### Images only:

* jpg
* png
* webp

---

## Max size

```text id="1ctihj"
5MB
```

---

# 33. Logging Rules

## Log:

* payment
* admin action
* transaction
* auth events

---

# 34. Testing Rules

# Frontend

* component test
* hook test

---

# Backend

* API test
* service test
* permission test

---

# 35. SEO Rules

## SEO Friendly

* slug
* meta title
* meta description
* sitemap

---

# 36. Accessibility Rules

## Accessibility

* semantic HTML
* keyboard navigation
* aria labels

---

# 37. AI Agent Rules

## AI Generated Code

Phải:

* đúng structure
* đúng naming
* không hardcode
* reusable
* typed đầy đủ

---

# 38. Documentation Rules

## Mọi module phải có:

* README
* API docs
* type docs

---

# 39. Deployment Rules

## Production

* Dockerized
* environment separated
* HTTPS only
* Cloudflare protected

---

# 40. Forbidden Rules

# ❌ Cấm

* hardcode API URL
* dùng any
* duplicate code
* inline CSS
* business logic trong component
* query DB trực tiếp trong views lớn
* commit secrets
* upload file không validate

---

# 41. Final Philosophy

## Hệ thống phải:

* scalable
* maintainable
* modular
* secure
* mobile-first
* multi-game ready
* AI-agent friendly
