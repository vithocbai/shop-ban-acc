
# .agents/skills/ai-lookup/skill.md

# 🔍 AI LOOKUP SKILL

AI Skill – Search & Analyze Existing Codebase

---

# 1. Mục Tiêu

Skill giúp AI:

* đọc structure project
* hiểu flow hệ thống
* trace dependency
* analyze architecture

---

# 2. AI Responsibilities

AI phải:

* tìm đúng module
* không duplicate feature
* reuse existing code
* follow architecture

---

# 3. Lookup Priority

## Ưu tiên tìm:

```text
features/
apps/
services/
hooks/
types/
```

---

# 4. Search Strategy

## Frontend

Tìm:

* components
* hooks
* stores
* services

---

## Backend

Tìm:

* services
* selectors
* models
* serializers

---

# 5. Forbidden

❌ Không:

* tạo duplicate component
* tạo duplicate API
* phá structure

---

# 6. Final Goal

AI phải:

* hiểu project trước khi generate
* reuse code tối đa
* maintain consistency

---