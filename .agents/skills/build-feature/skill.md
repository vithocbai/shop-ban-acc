# .agents/skills/build-feature/skill.md

# 🛠 BUILD FEATURE SKILL

AI Skill – Generate Full Feature Module

---

# 1. Mục Tiêu

Skill này giúp AI:

* tạo feature hoàn chỉnh
* đúng architecture
* scalable
* typed-safe
* reusable

---

# 2. Feature Structure

## Frontend

```text
features/
└── feature-name/
    ├── components/
    ├── hooks/
    ├── services/
    ├── store/
    ├── pages/
    ├── types.ts
    └── constants.ts
```

---

## Backend

```text
apps/
└── feature_name/
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    ├── services/
    ├── selectors/
    └── tests/
```

---

# 3. AI Responsibilities

AI phải:

* tạo đầy đủ structure
* generate typed code
* responsive UI
* API integration
* loading/error states
* **Comment giải thích code bằng Tiếng Việt**
* **Mô tả ngắn gọn các thay đổi bằng Tiếng Việt**

---

# 4. Frontend Rules

## Stack

* ReactJS
* TypeScript
* TailwindCSS v4 (base styling engine)
* **shadcn/ui** (dùng `npx shadcn add <component>`)
* Zustand
* React Query

---

# 5. Backend Rules

## Stack

* Django
* DRF
* PostgreSQL

---

# 6. UI Rules

## shadcn/ui – Component Library chính

* Khi cần Button, Input, Dialog, Table, Card, Sheet, Badge... phải dùng shadcn/ui.
* Cài bằng: `npx shadcn add <component>` (ví dụ: `npx shadcn add dialog table`)
* Sau khi cài, import từ `@/components/ui/<component>`.
* Dùng Tailwind class để điều chỉnh style khi shadcn/ui chưa đáp ứng đủ.
* Phải kế thừa Design System từ `docs/PROJECT-RULES.md` (màu `#008BFF`, font `Roboto`...)
* Luôn ưu tiên Mobile-first và Responsive Layout.

---

# 7. Forbidden

❌ Không:

* dùng any
* inline CSS
* hardcode URL
* duplicate code

---

# 8. Output Requirement

AI phải output:

* folder structure
* types
* services
* hooks
* components
* API integration
* responsive UI
* loading state
* error handling

---

# 9. Final Goal

Feature phải:

* production-ready
* scalable
* maintainable
* reusable
* responsive

---

# 10. Post-Build Requirement

* Phải chạy Skill `update-docs/skill.md` để đồng bộ tài liệu ngay sau khi hoàn thành code.
