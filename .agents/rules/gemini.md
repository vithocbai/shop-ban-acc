---
trigger: always_on
---

# .agents/rules/gemini.md

# 🧠 GEMINI AI RULES

AI Agent Rules & Coding Standards

---

# 1. Tổng Quan

Tài liệu này định nghĩa:

* quy tắc cho AI agent
* coding standards
* architecture rules
* UI conventions
* response format
* generation constraints

Mục tiêu:

* AI generate đúng structure
* code clean
* scalable
* maintainable
* production-ready

---

# 2. AI Mission

AI phải:

* hỗ trợ developer
* generate code đúng chuẩn
* không phá kiến trúc hệ thống
* reusable first
* modular first

---

# 3. Core Principles

## Bắt buộc

### 1. Modular Architecture

Mọi feature phải độc lập.

---

### 2. Clean Code

Ưu tiên:

* dễ đọc
* dễ maintain
* rõ ràng

---

### 3. Scalable First

Code phải hỗ trợ:

* multi-game
* mở rộng module
* scaling lớn

---

### 4. Reusable Components

Không duplicate component.

---

### 5. Separation of Concerns

Tách:

* UI
* business logic
* state
* API

---

# 4. Frontend Rules

# Frontend Stack

* ReactJS
* TypeScript
* TailwindCSS v4 (base styling engine)
* **shadcn/ui** (component library – `npx shadcn add <component>`)
* Zustand
* React Query

---

# 5. Frontend Structure Rules

## Bắt buộc dùng feature-based architecture

```text id="jlwm200"
src/features/
```

---

## ❌ Không generate

```text id="jlwm202"
src/pages/
src/components/pages/
```

---

## ✅ Đúng

```text id="jlwm204"
features/account/
features/order/
features/payment/
```

---

# 6. Component Rules

## Component phải:

* typed đầy đủ
* reusable
* responsive
* mobile-first

---

## Naming

### ✅ Đúng

```tsx id="jlwm206"
AccountCard.tsx
AccountFilter.tsx
```

---

### ❌ Sai

```tsx id="jlwm208"
card.tsx
filter.tsx
```

---

# 7. TypeScript Rules

## Không dùng

```ts id="jlwm210"
any
```

---

## Luôn dùng:

* interface
* type
* enum

---

# 8. Styling Rules

## Component Library: shadcn/ui

* Dùng **shadcn/ui** làm component library chính.
* Cài component mới bằng lệnh: `npx shadcn add <tên-component>`
* TailwindCSS là nền tảng – dùng Tailwind class để custom thêm khi cần.
* Không tự viết lại component nếu shadcn/ui đã có sẵn.

---

## ❌ Không dùng:

* inline CSS
* bootstrap
* material ui
* ant design

---

# 9. UI Philosophy

## Thiết Kế Shop Game

* Nền trắng chủ đạo, hiện đại, tối giản, gaming nhẹ
* Component Library: **shadcn/ui** (Radix UI primitives + Tailwind)
* Icon: **lucide-react** (mặc định)

---

## Font

* **Roboto** (Google Fonts) — khai báo trong `globals.css`

---

## Color System (CSS Variables)

Dùng CSS variables — **không hardcode hex**:

| CSS Variable | Giá trị | Tailwind class |
| ------------ | ------- | -------------- |
| `--primary` | `#008BFF` | `bg-primary`, `text-primary` |
| `--background` | `#FFFFFF` | `bg-background` |
| `--muted` | `#F9F7FA` | `bg-muted` |
| `--border` | `#E5E7E9` | `border-border` |
| `--foreground` | `#1E293B` | `text-foreground` |
| `--muted-foreground` | `#647488` | `text-muted-foreground` |
| `--destructive` | `#EF4444` | `text-destructive` |

---

## Border Radius

* Cấu hình qua `--radius` trong `globals.css`.
* Thứ tự ưu tiên: `rounded-md` → `rounded-lg` → `rounded-xl`
* ❌ Không tùy tiện dùng `rounded-2xl` nếu không đồng nhất ở cả trang.

---

# 10. Responsive Rules

## Mobile First

AI phải generate:

```text id="jlwm216"
mobile → tablet → desktop
```

---

## Ưu tiên:

* responsive grid
* sticky CTA
* bottom navigation mobile

---

# 11. Backend Rules

# Backend Stack

* Django
* DRF
* PostgreSQL
* Redis

---

# 12. Django Architecture Rules

## Structure

```text id="jlwm218"
apps/
    ├── account/
    ├── order/
    ├── payment/
    └── user/
```

---

## Business Logic

### ❌ Không viết trong:

* views.py
* serializers.py

---

### ✅ Viết trong:

```text id="jlwm220"
services/
```

---

# 13. Selector Rules

## Query DB phải nằm:

```text id="jlwm222"
selectors/
```

---

# 14. Database Rules

## Multi-game Architecture

### ❌ Không tạo:

```text id="jlwm224"
lienquan_accounts
ngocrong_accounts
```

---

### ✅ Đúng:

```text id="jlwm226"
games
accounts
```

---

## Dynamic Fields

Dùng:

```text id="jlwm228"
JSONB
```

---

# 15. API Rules

## API Response Format

### Success

```json id="jlwm230"
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

### Error

```json id="jlwm232"
{
  "success": false,
  "message": "Validation Error",
  "errors": {}
}
```

---

# 16. Security Rules

## Không được:

* log password
* expose token
* hardcode secrets

---

## Bắt buộc:

* validate payload
* sanitize input
* permission check

---

# 17. Performance Rules

## Frontend

* lazy loading
* memoization
* code splitting

---

## Backend

* select_related
* prefetch_related
* caching
* indexing

---

# 18. Naming Convention

# Frontend

## File Naming

```text id="jlwm234"
PascalCase.tsx
camelCase.ts
```

---

# Backend

## API Naming

```text id="jlwm236"
/api/accounts/
/api/orders/
```

---

# Database

## Table Naming

```text id="jlwm238"
snake_case
plural_table_names
```

---

# 19. State Management Rules

## Zustand

Dùng cho:

* auth
* cart
* UI state

---

## React Query

Dùng cho:

* API cache
* async state
* pagination

---

# 20. Form Rules

## Form phải:

* validate client
* validate server
* loading state
* error state

---

# 21. Upload Rules

## Chỉ cho phép:

* jpg
* png
* webp

---

## Max Size

```text id="jlwm240"
5MB
```

---

# 22. AI Response Rules

## AI phải:

* generate đầy đủ
* không pseudo-code
* không bỏ TODO
* không generate code lỗi
* **Luôn viết comment giải thích code bằng Tiếng Việt (ngắn gọn, dễ hiểu)**
* **Giải thích các bước thực hiện bằng Tiếng Việt**

---

## Nếu thiếu context:

AI phải:

* dùng convention project
* không tự phá architecture

---

# 23. Forbidden Rules

# ❌ CẤM

* dùng any
* hardcode URL
* duplicate code
* inline style
* business logic trong component
* query DB lớn trong views
* tạo table riêng từng game

---

# 24. Documentation Rules

## Mọi module phải có:

* types
* services
* hooks
* components rõ ràng

---

# 25. Git Rules

## Commit Format

```text id="jlwm242"
feat(scope): message
fix(scope): message
refactor(scope): message
```

---

# 26. Testing Rules

## Frontend

* component test
* hook test

---

## Backend

* API test
* permission test
* service test

---

# 27. Admin Dashboard Rules

## Admin UI phải:

* responsive
* table optimized
* filter/search tốt
* realtime state

---

# 28. Shop Account Rules

## Account phải:

* dynamic fields
* image gallery
* account status
* delivery automation

---

# 29. Payment Rules

## Payment System

Hỗ trợ:

* QR Bank
* Momo
* Card

---

## Payment Flow

```text id="jlwm244"
Create order
    ↓
Verify payment
    ↓
Auto delivery
```

---

# 30. Final Philosophy

# Triết Lý AI Agent

AI phải generate:

* scalable code
* production-ready
* maintainable
* reusable
* responsive
* typed-safe
* clean architecture
* AI-agent friendly
