# flows/save-publish.md

# 💾 SAVE & PUBLISH FLOW

Flow lưu dữ liệu, autosave và publish hệ thống shop acc game

---

# 1. Tổng Quan

Hệ thống Save & Publish giúp:

* lưu dữ liệu realtime
* autosave
* tránh mất dữ liệu
* publish nội dung
* rollback phiên bản
* quản lý trạng thái draft/published

---

# 2. Core Concepts

# Trạng Thái Nội Dung

```text id="3s9l2m"
DRAFT
PUBLISHED
ARCHIVED
```

---

# 3. Main Flow

## Tổng Flow

```text id="8l4m5k"
User Edit Content
        ↓
Local State Update
        ↓
Autosave Draft
        ↓
Manual Save
        ↓
Validation
        ↓
Publish
        ↓
Public Website Update
```

---

# 4. Draft Flow

# Draft System

## Flow

```text id="jlwmz1"
User editing
      ↓
Save local state
      ↓
Autosave draft
      ↓
Persist database
```

---

## Draft Purpose

Draft dùng để:

* lưu tạm
* recovery crash
* rollback
* preview unpublished content

---

# 5. Autosave Flow

# Autosave

## Flow

```text id="jlwmz3"
User changes data
      ↓
Debounce 500ms
      ↓
Compare diff
      ↓
Save draft API
```

---

## Không autosave:

* loading state
* hover state
* temporary UI

---

# 6. Manual Save Flow

# Save Action

## Flow

```text id="jlwmz5"
Click Save
      ↓
Validate form
      ↓
Generate payload
      ↓
API save draft
      ↓
Update save status
```

---

# 7. Save States

# Save Status

| State  | Meaning        |
| ------ | -------------- |
| idle   | chưa lưu       |
| saving | đang lưu       |
| saved  | lưu thành công |
| error  | lỗi lưu        |

---

## UI Example

```text id="jlwmz7"
Saving...
Saved
Save failed
```

---

# 8. Draft Database Structure

# Draft Schema

```sql id="jlwmz9"
drafts
- id
- entity_type
- entity_id
- content JSONB
- version
- created_by
- created_at
```

---

# 9. Versioning System

# Version Control

## Flow

```text id="jlwmzb"
Edit content
      ↓
Create snapshot version
      ↓
Store history
      ↓
Allow rollback
```

---

## Version Example

```text id="jlwmzd"
v1
v2
v3
v4
```

---

# 10. Publish Flow

# Publish Content

## Flow

```text id="jlwmzf"
Click Publish
      ↓
Validate content
      ↓
Create published version
      ↓
Invalidate cache
      ↓
Update frontend data
```

---

# 11. Publish Validation

# Validation Rules

## Required Checks

* title required
* thumbnail required
* valid status
* valid game data
* image uploaded

---

## Example

### ❌ Invalid

```text id="jlwmzh"
Missing title
```

---

### ✅ Valid

```text id="jlwmzj"
Ready to publish
```

---

# 12. Cache Invalidation Flow

# Redis Cache

## Flow

```text id="jlwmzl"
Publish content
      ↓
Clear cache
      ↓
Frontend refetch
      ↓
New content visible
```

---

# 13. Account Publish Flow

# Publish Account

## Flow

```text id="jlwmzn"
Create account
      ↓
Draft mode
      ↓
Admin review
      ↓
Publish
      ↓
Visible on website
```

---

## Account States

```text id="jlwmzp"
DRAFT
PUBLISHED
HIDDEN
SOLD
ARCHIVED
```

---

# 14. News Publish Flow

# Publish News

## Flow

```text id="jlwmzr"
Create article
      ↓
Save draft
      ↓
Preview
      ↓
Publish
      ↓
SEO indexing
```

---

# 15. Banner Publish Flow

# Banner System

## Flow

```text id="jlwmzt"
Create banner
      ↓
Upload image
      ↓
Preview
      ↓
Publish
      ↓
Homepage update
```

---

# 16. Multi Page Save Flow

# Multi Page Builder

## Flow

```text id="jlwmzv"
Edit page
      ↓
Save page JSON
      ↓
Update project state
      ↓
Publish project
```

---

# 17. Builder JSON Save

# Builder Layout

## Example

```json id="jlwmzx"
{
  "page_id": "home",
  "layout": [],
  "settings": {}
}
```

---

# 18. API Save Flow

# Frontend → Backend

## Flow

```text id="jlwmzz"
Frontend payload
      ↓
Validate serializer
      ↓
Business service
      ↓
Database save
      ↓
Response success
```

---

# 19. Optimistic UI Flow

# Optimistic Update

## Flow

```text id="jlwm101"
User save
      ↓
Immediate UI update
      ↓
Background API request
      ↓
Rollback if failed
```

---

# 20. Error Recovery Flow

# Save Error

## Flow

```text id="jlwm103"
Save failed
      ↓
Retry save
      ↓
Notify user
      ↓
Keep local draft
```

---

# 21. Offline Draft Flow

# Offline Support

## Flow

```text id="jlwm105"
No internet
      ↓
Save local draft
      ↓
Reconnect
      ↓
Sync server
```

---

## Storage

* localStorage
* IndexedDB

---

# 22. Publish Permissions

# Permission Rules

## Only:

* admin
* super_admin

Có quyền publish.

---

## Moderator:

* save draft
* submit review

---

# 23. Review Flow

# Content Review

## Flow

```text id="jlwm107"
Moderator create draft
      ↓
Submit review
      ↓
Admin review
      ↓
Approve publish
```

---

# 24. Rollback Flow

# Restore Version

## Flow

```text id="jlwm109"
Select old version
      ↓
Restore snapshot
      ↓
Save new version
```

---

# 25. Publish Queue Flow

# Queue System

## Future Scaling

```text id="jlwm10b"
Publish request
      ↓
Queue worker
      ↓
Process content
      ↓
Deploy cache update
```

---

# 26. SEO Publish Flow

# SEO System

## Flow

```text id="jlwm10d"
Publish page
      ↓
Generate meta
      ↓
Update sitemap
      ↓
Search engine indexing
```

---

# 27. Analytics Flow

# Analytics Tracking

## Track

* save count
* publish count
* rollback count
* failed saves

---

# 28. UI Requirements

# Save UI

## Toolbar

```text id="jlwm10f"
[ Save Draft ]
[ Preview ]
[ Publish ]
```

---

## Status

```text id="jlwm10h"
Saving...
Saved successfully
Publish successful
```

---

# 29. Recommended Backend Design

# Django Architecture

## Save Logic

```text id="jlwm10j"
views
    ↓
services
    ↓
selectors
    ↓
models
```

---

## Không viết:

* business logic trong views
* DB query lớn trong serializers

---

# 30. Recommended Frontend Design

# React Architecture

## Save State

```text id="jlwm10l"
Zustand
React Query
Autosave hooks
```

---

## Builder State

```text id="jlwm10n"
local state
history state
draft state
publish state
```

---

# 31. Security Rules

# Security

## Validate:

* permission
* payload
* ownership

---

## Không publish:

* invalid data
* corrupted JSON
* unsafe HTML

---

# 32. Performance Optimization

# Optimization

## Tối ưu:

* debounce save
* patch update
* lazy validation
* cache invalidate selective

---

# 33. Edge Cases

# Special Cases

## Cases cần xử lý

* double publish
* lost internet
* outdated draft
* concurrent editing
* rollback conflict

---

# 34. Future Scaling

# Future Features

## Future

```text id="jlwm10p"
Realtime collaboration
Auto backup
Version compare
Cloud sync
AI content suggestion
```

---

# 35. Final Philosophy

# Triết Lý Hệ Thống

Save & Publish phải:

* realtime
* reliable
* recoverable
* scalable
* predictable
* user friendly
* automation-first
