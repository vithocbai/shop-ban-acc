# flows/undo-redo.md

# 🔄 UNDO / REDO SYSTEM FLOW

Hệ thống quản lý lịch sử thao tác cho Admin Dashboard & Builder

---

# 1. Tổng Quan

Undo / Redo giúp:

* hoàn tác thao tác
* khôi phục thao tác
* tăng UX
* tránh mất dữ liệu
* hỗ trợ editor realtime

---

# 2. Mục Tiêu Hệ Thống

## Requirements

Hệ thống cần:

* realtime update
* lưu lịch sử thao tác
* rollback state
* restore state
* lightweight
* performant

---

# 3. Core Concept

## State History

```text id="r6i9wy"
PAST
CURRENT
FUTURE
```

---

## Flow

```text id="u2t6yl"
User Action
      ↓
Save Current State → PAST
      ↓
Apply New State
      ↓
Clear FUTURE
```

---

# 4. Undo Flow

# Undo Action

## Flow

```text id="jlwmtt"
User Press Undo
        ↓
Move CURRENT → FUTURE
        ↓
Restore Latest PAST
        ↓
Update UI
```

---

## Example

### Before Undo

```text id="e5hh7f"
PAST:
[A]
[B]

CURRENT:
[C]

FUTURE:
[]
```

---

### After Undo

```text id="4twk5x"
PAST:
[A]

CURRENT:
[B]

FUTURE:
[C]
```

---

# 5. Redo Flow

# Redo Action

## Flow

```text id="x9x7gq"
User Press Redo
        ↓
Move CURRENT → PAST
        ↓
Restore FUTURE state
        ↓
Update UI
```

---

## Example

### Before Redo

```text id="s5lg8v"
PAST:
[A]

CURRENT:
[B]

FUTURE:
[C]
```

---

### After Redo

```text id="a8p9r2"
PAST:
[A]
[B]

CURRENT:
[C]

FUTURE:
[]
```

---

# 6. State Structure

# History Store

```ts id="jlwmu0"
interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}
```

---

# 7. Builder State Structure

# Builder JSON

```ts id="h4x1gm"
interface BuilderState {
  pages: Page[]
  selectedNodeId?: string
  viewport: Viewport
}
```

---

# 8. Undo/Redo Actions

## Supported Actions

| Action           | Undoable |
| ---------------- | -------- |
| Add component    | ✅        |
| Delete component | ✅        |
| Move component   | ✅        |
| Update text      | ✅        |
| Change style     | ✅        |
| Reorder layout   | ✅        |
| Change settings  | ✅        |

---

# 9. Non-Undoable Actions

## Không lưu history cho:

| Action        | Reason        |
| ------------- | ------------- |
| Hover         | temporary     |
| Scroll        | UI state      |
| Resize window | browser event |
| API loading   | async state   |

---

# 10. Save History Strategy

# Save Timing

## Khi nào save history?

### Save on:

* drag end
* input blur
* setting change
* delete action
* add component

---

## Không save liên tục

❌ Sai:

```text id="jlwmu7"
save every keypress
```

---

✅ Đúng:

```text id="u7fx0s"
debounce save
```

---

# 11. Debounce Strategy

# Debounce

## Recommended

```text id="6xqx4l"
300ms - 500ms
```

---

## Flow

```text id="jlwmuc"
Typing
    ↓
Wait debounce
    ↓
Save history snapshot
```

---

# 12. Snapshot Strategy

# Immutable Snapshot

## Rule

Mỗi history:

* phải immutable
* không mutate object cũ

---

## ❌ Sai

```ts id="2o8s2g"
state.title = "new"
```

---

## ✅ Đúng

```ts id="e6d9h8"
{
  ...state,
  title: "new"
}
```

---

# 13. History Limit

# Giới Hạn History

## Recommended

```text id="jlwmug"
50 - 100 snapshots
```

---

## Flow

```text id="s7e6zz"
If limit exceeded
      ↓
Remove oldest history
```

---

# 14. Performance Strategy

# Performance

## Không clone toàn bộ state quá lớn

---

## Tối ưu bằng:

* shallow copy
* structural sharing
* patch updates

---

# 15. Zustand Store Example

# Store Structure

```ts id="jlwmuk"
interface BuilderStore {
  history: HistoryState<BuilderState>

  undo: () => void
  redo: () => void

  pushState: (state: BuilderState) => void
}
```

---

# 16. Push State Flow

# Push New State

## Flow

```text id="jlwmum"
Current State
      ↓
Push to past
      ↓
Update present
      ↓
Clear future
```

---

# 17. Undo Availability

# Undo Button State

## Logic

```text id="jlwmuo"
past.length > 0
```

---

## Redo Logic

```text id="jlwmuq"
future.length > 0
```

---

# 18. Keyboard Shortcuts

# Shortcuts

| Action   | Shortcut         |
| -------- | ---------------- |
| Undo     | Ctrl + Z         |
| Redo     | Ctrl + Shift + Z |
| Redo Mac | Cmd + Shift + Z  |

---

# 19. Builder Integration

# Builder Engine

Undo/Redo áp dụng cho:

* canvas
* layout tree
* style editor
* component editor

---

# 20. Drag & Drop Flow

# Drag Component

## Flow

```text id="6v7x4v"
Drag start
      ↓
Preview movement
      ↓
Drop component
      ↓
Save snapshot
```

---

# 21. Delete Component Flow

# Delete Action

## Flow

```text id="jlwmuv"
Delete component
      ↓
Save previous state
      ↓
Remove node
      ↓
Update UI
```

---

# 22. Text Editing Flow

# Text Editor

## Flow

```text id="jlwmux"
Typing
    ↓
Debounce
    ↓
Save snapshot
```

---

# 23. Multi Page Builder Flow

# Multi Page History

## Options

### Global History

* toàn project

---

### Page History

* riêng từng page

---

## Recommended

```text id="jlwmv1"
history per page
```

---

# 24. Persistence Strategy

# Local Persistence

## Optional

Lưu history vào:

* localStorage
* IndexedDB

---

## Flow

```text id="jlwmv3"
Save history
      ↓
Browser storage
      ↓
Restore session
```

---

# 25. Collaborative Editing Notes

# Future Collaboration

Nếu realtime multi-user:

* operational transform
* CRDT
* server sync

---

# 26. Memory Optimization

# Optimization

## Không lưu:

* duplicated large images
* temporary states
* loading states

---

## Chỉ lưu:

* JSON layout
* component props
* style data

---

# 27. Error Recovery

# Crash Recovery

## Flow

```text id="jlwmv7"
Unexpected crash
      ↓
Restore latest snapshot
      ↓
Recover editor
```

---

# 28. UI Requirements

# Undo/Redo UI

## Toolbar

```text id="jlwmv9"
[ Undo ] [ Redo ]
```

---

## Disabled State

* opacity thấp
* cursor disabled

---

# 29. Recommended Tech

# Recommended Stack

## Frontend

* Zustand
* Immer
* React DnD

---

## Persistence

* localStorage
* IndexedDB

---

# 30. Edge Cases

# Special Cases

## Cases cần xử lý

* rapid undo spam
* deleted selected node
* nested component move
* async save conflict
* page switch history

---

# 31. Security Notes

## Không restore:

* sensitive tokens
* auth state
* server secrets

---

# 32. Final Philosophy

# Triết Lý Hệ Thống

Undo/Redo phải:

* realtime
* lightweight
* predictable
* immutable
* scalable
* performant
* user friendly
