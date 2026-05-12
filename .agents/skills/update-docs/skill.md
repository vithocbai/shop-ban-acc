
# .agents/skills/update-docs/skill.md

# 📝 UPDATE DOCS SKILL

AI Skill – Keep System Documentation Up-to-Date

---

# 1. Mục Tiêu

Skill này giúp AI:

* Tự động cập nhật tài liệu khi có thay đổi code
* Đảm bảo kiến trúc thực tế khớp với `ARCHITECTURE.md`
* Đồng bộ API thực tế với `API-CONTRACT.md`
* Cập nhật Schema database/JSON trong `DATA-SCHEMA.md`

---

# 2. Quy Tắc Cập Nhật

## Khi tạo Feature mới:

* Cập nhật sơ đồ thư mục trong `ARCHITECTURE.md` (nếu có folder mới)
* Thêm endpoint mới vào `API-CONTRACT.md`
* Cập nhật bảng dữ liệu hoặc JSON Schema trong `DATA-SCHEMA.md`
* Tạo `README.md` riêng cho feature nếu module đó phức tạp

## Khi sửa Logic hiện có:

* Kiểm tra xem business flow trong các file `docs/flows/` có thay đổi không
* Cập nhật lại mô tả API nếu thay đổi params hoặc response

---

# 3. Định Dạng Tài Liệu

* Sử dụng chuẩn GitHub Flavored Markdown
* Có Emoji để phân loại thông tin (🎨 UI, ⚙️ Config, 🧠 Logic...)
* Sơ đồ cây (Tree structure) phải dùng ký tự unicode `├──`, `└──`

---

# 4. Forbidden

❌ Không:

* Để tài liệu bị lỗi thời (Out-of-date) so với code thực tế
* Viết tài liệu quá dài dòng, không trọng tâm
* Quên cập nhật file `README.md` tổng của dự án khi có thay đổi lớn ở root

---

# 5. Final Goal

Tài liệu phải:

* Luôn là "Nguồn sự thật" (Source of Truth) của dự án
* Giúp Developer mới vào hiểu hệ thống ngay lập tức
* Nhìn chuyên nghiệp, sẵn sàng bàn giao cho khách hàng bất cứ lúc nào

---
