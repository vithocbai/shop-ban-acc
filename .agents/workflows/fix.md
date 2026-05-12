---
description: # .agents/workflows/fix.md  # 🛠 FIX WORKFLOW  AI Workflow – Debug & Fix System Issues
---


# .agents/workflows/fix.md

# 🛠 FIX WORKFLOW

AI Workflow – Debug & Fix System Issues

---

# 1. Mục Tiêu

Workflow giúp AI:

* debug issue
* trace root cause
* fix bug an toàn
* không phá feature khác

---

# 2. Main Flow

```text
Detect Issue
      ↓
Analyze Logs
      ↓
Trace Root Cause
      ↓
Validate Architecture
      ↓
Apply Fix
      ↓
Test Fix
```

---

# 3. Bug Analysis

## AI phải xác định:

* frontend bug
* backend bug
* API bug
* state issue
* UI issue

---

# 4. Frontend Debug Flow

# Frontend

## Kiểm tra:

* component render
* props
* hooks
* state update
* API request
* responsive UI

---

# 5. Backend Debug Flow

# Backend

## Kiểm tra:

* serializer
* service logic
* selector query
* permissions
* transaction logic

---

# 6. API Debug Flow

## Check:

* payload
* response
* validation
* status code
* auth token

---

# 7. Database Debug Flow

## Check:

* relations
* indexing
* query performance
* migrations

---

# 8. Performance Fix Flow

## Frontend

* memoization
* lazy loading
* rerender optimization

---

## Backend

* query optimization
* cache strategy
* select_related
* prefetch_related

---

# 9. Security Validation

## AI phải check:

* auth validation
* permission
* payload sanitize
* sensitive data exposure

---

# 10. Regression Prevention

## Sau fix phải:

* verify old flow
* verify related modules
* avoid side effects

---

# 11. Forbidden

❌ Không:

* fix tạm
* hardcode workaround
* bỏ qua validation
* patch phá architecture

---

# 12. Testing Requirements

## Sau fix:

* verify UI
* verify API
* verify database
* verify permissions

---

# 13. Final Goal

Bug fix phải:

* stable
* scalable
* clean
* maintainable
* production-safe

---

---