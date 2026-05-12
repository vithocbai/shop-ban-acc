---
description: .agents/workflows/catchup.md 🔄 CATCHUP WORKFLOW  AI Workflow – Analyze & Continue Existing Project
---

# .agents/workflows/catchup.md

# 🔄 CATCHUP WORKFLOW

AI Workflow – Analyze & Continue Existing Project

---

# 1. Mục Tiêu

Workflow giúp AI:

* hiểu project hiện tại
* đọc architecture
* detect feature
* tiếp tục code đúng flow
* tránh duplicate logic

---

# 2. Main Flow

```text
Read Project Structure
        ↓
Read Documentation
        ↓
Analyze Existing Modules
        ↓
Detect Dependencies
        ↓
Understand Current Flow
        ↓
Continue Implementation
```

---

# 3. Priority Files

## AI phải đọc trước:

```text
docs/ARCHITECTURE.md
docs/API-CONTRACT.md
docs/DATA-SCHEMA.md
docs/PROJECT-RULES.md
```

---

# 4. Frontend Analysis Flow

# Frontend

## AI phải scan:

```text
src/features/
src/components/
src/services/
src/hooks/
src/types/
```

---

## Detect:

* reusable components
* existing hooks
* API services
* stores
* layouts

---

# 5. Backend Analysis Flow

# Backend

## AI phải scan:

```text
backend/apps/
backend/common/
```

---

## Detect:

* services
* selectors
* serializers
* permissions
* models

---

# 6. Dependency Analysis

## AI phải check:

* feature dependency
* API usage
* shared state
* reusable logic

---

# 7. Architecture Validation

## AI phải validate:

* feature-based architecture
* modular structure
* naming convention
* business logic separation

---

# 8. Existing Code Reuse

## Ưu tiên:

* reuse component
* reuse service
* reuse hook
* reuse selector

---

# 9. Forbidden

❌ Không:

* tạo duplicate feature
* phá architecture
* hardcode logic
* bypass existing services

---

# 10. UI Validation

## Kiểm tra:

* responsive
* mobile-first
* white clean UI
* đúng design system

---

# 11. State Validation

## AI phải detect:

* Zustand stores
* React Query hooks
* global state
* feature state

---

# 12. API Validation

## Kiểm tra:

* endpoint naming
* response format
* auth flow
* pagination structure

---

# 13. Catchup Output

## Sau khi analyze AI phải hiểu:

* project structure
* business flow
* coding convention
* feature dependencies
* API flow

---

# 14. Final Goal

AI phải:

* onboard project nhanh
* continue code chính xác
* maintain consistency
* không phá hệ thống

---
