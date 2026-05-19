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

* Dùng **shadcn/ui** làm component library chính.
* Cài component bằng: `npx shadcn add <tên-component>`
* **TailwindCSS** vẫn là nền tảng – dùng Tailwind class để custom thêm khi cần.

---

## ✅ Import đúng chuẩn shadcn/ui

**Đường dẫn import** (sau khi cài bằng `npx shadcn add`):

```tsx
// ✅ Luôn import từ @/components/ui/<tên> (alias) hoặc đường dẫn tương đối
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge }    from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
```

> Nếu project chưa cấu hình alias `@/`, dùng đường dẫn tương đối:
> `import { Input } from "../../../components/ui/input";`

---

## ✅ Ví dụ sử dụng đúng

### Input + Label + Error

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn }    from "@/lib/utils";

<div className="space-y-1.5">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Nhập email..."
    className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
  />
  {hasError && (
    <p className="text-sm text-destructive">{errorMessage}</p>
  )}
</div>
```

### Button với trạng thái loading

```tsx
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

<Button type="submit" disabled={isLoading} className="w-full">
  {isLoading && <Loader2 className="animate-spin" data-icon="inline-start" />}
  {isLoading ? "Đang xử lý..." : "Đăng nhập"}
</Button>
```

### Card

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Tiêu đề</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Nội dung */}
  </CardContent>
</Card>
```

### Dialog (Modal)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tiêu đề Modal</DialogTitle>
    </DialogHeader>
    {/* Nội dung modal */}
  </DialogContent>
</Dialog>
```

### Table

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Tên</TableHead>
      <TableHead>Trạng thái</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell><Badge>{row.status}</Badge></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## ❌ Không dùng:

* Thẻ HTML thuần (`<input>`, `<button>`, `<label>`) khi đã có component shadcn/ui tương đương
* inline style / style prop
* Bootstrap, Material UI, Ant Design
* Hardcode hex color vào className (dùng CSS variables: `text-destructive`, `bg-primary`...)
* Tự viết lại component đã có trong shadcn/ui

---

# 12. Tailwind Rules

## Quy tắc kết hợp shadcn/ui + Tailwind

* Tailwind chỉ dùng để **custom thêm** lên các component shadcn/ui, không viết UI từ đầu.
* ❌ Không viết className quá dài và lặp lại — tách vào `cn()` hoặc variant.
* ✅ Dùng hàm `cn()` (từ `@/lib/utils`) để merge class có điều kiện.

```tsx
// ✅ Đúng
<Button className={cn("w-full", isLoading && "opacity-50")} />
```

---

# 13. UI Design Rules

## Thiết Kế Tổng Quan

* Nền trắng chủ đạo, hiện đại, tối giản, gaming nhẹ
* Component Library: **shadcn/ui** (Radix UI primitives + Tailwind)
* Icon Library: **lucide-react** (mặc định của shadcn)

---

## Font

* Font chính: **Roboto** (Google Fonts)
* Khai báo trong `globals.css` hoặc `layout.tsx`, không hardcode inline.

---

## Color System (CSS Variables của shadcn/ui)

Cấu hình màu qua CSS variables trong `globals.css` — **không hardcode hex vào Tailwind class**:

| CSS Variable | Giá trị mặc định | Dùng cho |
| ------------ | ---------------- | -------- |
| `--primary` | `#008BFF` | Nút chính, link, focus |
| `--background` | `#FFFFFF` | Nền trang |
| `--card` | `#FFFFFF` | Nền card |
| `--muted` | `#F9F7FA` | Nền phụ, header bảng |
| `--border` | `#E5E7E9` | Viền |
| `--foreground` | `#1E293B` | Text chính |
| `--muted-foreground`| `#647488` | Text phụ |
| `--destructive` | `#EF4444` | Lỗi, xóa |

Dùng trong Tailwind bằng: `bg-primary`, `text-foreground`, `border-border`...

---

## Border Radius

* Cấu hình qua `--radius` trong `globals.css` (shadcn/ui chuẩn).
* Dùng class: `rounded-md` (button nhỏ), `rounded-lg` (card/dialog), `rounded-xl` (panel lớn).
* ❌ Không dùng `rounded-2xl` tùy tiện — phải nhất quán với `--radius`.

---

## Shadow

* Dùng `shadow-sm` cho card thông thường, `shadow-md` cho modal/dropdown.
* shadcn/ui component tự áp dụng shadow phù hợp — không override tùy tiện.

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
