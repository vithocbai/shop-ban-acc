
# .agents/skills/testing-standards/skill.md

# 🧪 TESTING STANDARDS SKILL

AI Skill – Quality Assurance & Comprehensive Testing

---

# 1. Mục Tiêu

Đảm bảo mọi đoạn code AI tạo ra đều được kiểm thử qua:

* Happy Path (Luồng chạy đúng).
* Edge Cases (Trường hợp biên/ngoại lệ).
* Error Handling (Xử lý khi có lỗi).

---

# 2. Tiêu Chuẩn Kiểm Thử

## Frontend:

* Phải test Loading và Error states.
* Phải test sự tương tác của User (Click, Type, Submit).
* Kiểm tra Responsive trên các kích thước màn hình.
* **Verify**: Luôn kiểm tra lại UI sau khi sửa logic.

## Backend:

* Test Validation dữ liệu đầu vào.
* Test Permission (Ai có quyền thực hiện?).
* Test Performance (Query có bị chậm không?).
* **Data Integrity**: Đảm bảo database không bị rác sau khi chạy test.

---

# 3. Quy Tắc "Zero-Regression"

* Mọi thay đổi lớn phải đi kèm với việc kiểm tra lại các tính năng cũ liên quan để đảm bảo không có gì bị hỏng.
* AI phải mô tả các bài test đã chạy thành công bằng Tiếng Việt.

---

# 4. Final Goal

Code bàn giao phải:

* Chạy ổn định trong mọi điều kiện.
* Có thông báo lỗi rõ ràng cho User/Developer.
* Đạt tiêu chuẩn chất lượng để bàn giao cho khách hàng.

---
