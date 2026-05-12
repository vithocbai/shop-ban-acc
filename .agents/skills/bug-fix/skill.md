
# .agents/skills/bug-fix/skill.md

# 🛠 BUG FIX SKILL

AI Skill – Root Cause Analysis & Stable Fixing

---

# 1. Mục Tiêu

Skill giúp AI:

* Tìm nguyên nhân gốc rễ (Root cause) thay vì sửa lỗi tạm thời (Workaround).
* Đảm bảo bản vá (Fix) không gây ra lỗi phụ (Side effects).
* Giữ vững kiến trúc hệ thống sau khi sửa.

---

# 2. Quy Trình Phân Tích

AI phải:

1. **Reproduce**: Tái hiện lỗi để hiểu rõ hành vi.
2. **Trace**: Truy vết từ UI -> State -> Service -> API -> DB.
3. **Analyze**: Tại sao lỗi xảy ra? (Logic sai, Thiếu dữ liệu, hay Race condition?).
4. **Fix**: Sửa lỗi dựa trên kiến trúc gốc.

---

# 3. Nguyên Tắc Sửa Lỗi

* **No Hardcoding**: Cấm dùng các giá trị fix cứng để che giấu lỗi.
* **Safety First**: Kiểm tra các module liên quan trước khi áp dụng.
* **Refactor if needed**: Nếu logic gốc quá rối gây ra lỗi, hãy đề xuất refactor.
* **Comment**: Giải thích nguyên nhân và cách sửa bằng Tiếng Việt (ngắn gọn).

---

# 4. Forbidden

❌ Không:

* Sửa lỗi này đẻ ra lỗi khác (Regression).
* Xóa code cũ khi chưa hiểu rõ mục đích của nó.
* Patch lỗi vi phạm `ARCHITECTURE.md`.

---

# 5. Final Goal

Bản fix phải:

* Triệt để, sạch sẽ, và có thể bảo trì lâu dài.
* Đã được verify qua các unit test liên quan.

---
