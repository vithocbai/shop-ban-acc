# 📜 PROJECT RULES

Tài liệu quy định các chuẩn mực lập trình (Coding Standards) và các quy ước (Conventions) dành cho dự án **Shop bán acc game**.
Mục tiêu đảm bảo mã nguồn (code) luôn sạch (clean), dễ bảo trì (maintainable), dễ mở rộng (scalable) và thân thiện với làm việc nhóm (teamwork) cũng như AI Agent.

---

# 1. CORE PRINCIPLES (Nguyên tắc cốt lõi)

- **Modular Architecture**: Các tính năng phải được phân chia thành các module (features/apps) độc lập.
- **Reusable Components**: Tối đa hóa việc tái sử dụng UI/Logic, không duplicate code.
- **Scalable First**: Thiết kế cơ sở dữ liệu và kiến trúc hướng tới việc dễ dàng mở rộng thêm nhiều game mới.
- **Mobile First**: Giao diện người dùng (Public Website) ưu tiên trải nghiệm trên thiết bị di động.
- **Clean Code**: Code dễ đọc, dễ hiểu ưu tiên hơn code "thông minh" nhưng phức tạp.
- **Separation of Concerns**: Phân tách rõ ràng giữa UI (Giao diện) và Business Logic (Nghiệp vụ).

---

# 2. FRONTEND RULES (ReactJS + Vite)

## 2.1. Tech Stack
- **Core**: ReactJS, TypeScript, Vite.
- **Styling**: TailwindCSS v4, shadcn/ui.
- **State/Data**: Zustand (Global UI State), React Query (Server State).

## 2.2. Folder Structure & Feature-based Architecture
Code phải được nhóm theo **Feature** (nghiệp vụ), không nhóm theo loại file.

❌ **Sai**: `src/components/pages/home.tsx` (gom tất cả components vào 1 chỗ)
✅ **Đúng**: `src/features/account/components/...` (tách riêng components của feature account)

Cấu trúc chuẩn của một feature:
```text
features/account/
├── components/   # UI components đặc thù của account
├── hooks/        # Custom hooks riêng biệt
├── services/     # Các hàm gọi API (axios)
├── store/        # Quản lý state cục bộ của feature
└── types.ts      # TypeScript interfaces/types
```

## 2.3. Component Naming & Types
- **PascalCase** cho tên file Component: `AccountCard.tsx`, `AccountFilter.tsx`.
- Phân loại Component:
  - `ui`: Reusable UI components (nằm trong `src/components/ui` - do shadcn tạo).
  - `shared`: Component dùng chung cho nhiều module (nằm trong `src/components/shared`).
  - `feature`: Component đặc thù nghiệp vụ (nằm trong `src/features/...`).
  - `layout`: Layout bọc ngoài các trang (nằm trong `src/components/layout`).

## 2.4. TypeScript
- Bắt buộc dùng TypeScript chặt chẽ (`strict: true`).
- ❌ **CẤM** sử dụng kiểu `any`.
- ✅ Luôn định nghĩa `interface`, `type`, `enum` rõ ràng cho Props, API Responses và State.

## 2.5. API Calls
- ❌ **KHÔNG** gọi trực tiếp thư viện HTTP (như `axios.get`) bên trong Component.
- ✅ Tất cả các lệnh gọi API phải được bọc trong các hàm ở thư mục `services/` và sử dụng thông qua `React Query`.

## 2.6. UI & Styling (shadcn/ui + TailwindCSS)
- Sử dụng **shadcn/ui** làm nền tảng UI (`npx shadcn add <component>`).
- Sử dụng hàm `cn()` (từ `clsx` + `tailwind-merge`) để gộp class một cách an toàn.
- **Màu sắc**: Không hardcode mã Hex (VD: `#FF0000`). Sử dụng biến CSS đã cấu hình: `bg-primary`, `text-destructive`, `border-border-color`.
- **Bo góc (Border Radius)**: Sử dụng các class chuẩn hệ thống như `rounded-md`, tránh lạm dụng `rounded-2xl` trừ trường hợp đặc thù thiết kế.

## 2.7. Quy tắc Phân Trang (Pagination) & Lọc (Filter)
Để đảm bảo phân trang và lọc dữ liệu hoạt động chính xác:
1. **State Quản Lý**: Quản lý URL Params thay vì Local State (nếu có thể) cho `page` và `pageSize`.
2. **React Query Dependency**: Bắt buộc đưa `page`, `pageSize`, `search`, `filters` vào Query Key để tự reload data.
3. **Quy Tắc Reset**: BẤT CỨ KHI NÀO người dùng thay đổi bộ lọc (Search, Filter) hoặc thay đổi số lượng dòng (`pageSize`), **BẮT BUỘC phải reset `page` về 1**.

## 2.8. Quy tắc Viết Comment Code
- Bắt buộc phải **viết comment ngắn gọn bằng tiếng việt** cho các đoạn code xử lý logic, tính toán, hoặc khi áp dụng một mẹo (trick) UI nào đó.
- Tập trung giải thích **TẠI SAO** (Why) lại viết đoạn code đó thay vì chỉ giải thích là code làm gì (What).

## 2.9. Quy tắc Layout & Cấu trúc Trang (Admin Pages)
- Khi xây dựng các trang Admin (Ví dụ: Trang quản lý, danh sách), **bắt buộc** phải đồng nhất cấu trúc HTML và `className`. Tham khảo `OrderManagement.tsx` và `UserList.tsx`.
- **Phần Header của trang (Ví dụ nằm trong `OrderManagement.tsx`):**
  ```tsx
  <div className="flex items-center gap-3 shrink-0 pb-2 border-b border-border-color">
      <div>
          <h1 className="text-2xl font-bold text-text-main leading-tight">Tiêu đề</h1>
          <p className="text-sm text-text-secondary mt-1">Mô tả ngắn.</p>
      </div>
  </div>
  ```
- **Bên trong Component Danh sách (Ví dụ: `UserList.tsx`):**
  - Wrapper ngoài cùng: `<div className="flex-1 flex flex-col min-h-0 space-y-2">`
  - Thanh công cụ (Toolbar): `<div className="pb-2 px-[1px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-0">`
  - Khối chứa Bảng: `<Card className="overflow-hidden flex-1 flex flex-col min-h-0">`
  - Thẻ Bảng: `<Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">`
  Việc tuân thủ chính xác các class `flex-1 flex flex-col min-h-0` cho khối nội dung và `shrink-0` cho Header/Toolbar là rất quan trọng để giao diện tự có thanh cuộn thay vì bị tràn xuống dưới màn hình.

---

# 3. BACKEND RULES (Django REST Framework)

## 3.1. Tech Stack
- Django, Django REST Framework, PostgreSQL, Redis.

## 3.2. Cấu Trúc App (Domain-Driven Design Lite)
Code trong mỗi app (nằm trong `apps/`) phải tuân thủ phân tách logic:
```text
apps/account/
├── models.py       # Định nghĩa bảng database
├── serializers.py  # Chuẩn hóa Data input/output (Không chứa logic nghiệp vụ)
├── views.py        # Controller xử lý Request/Response (Không chứa logic nghiệp vụ)
├── services/       # NƠI ĐẶT BUSINESS LOGIC (Tạo đơn, tính toán, gọi external API)
└── selectors/      # NƠI ĐẶT DB QUERIES (Filter, phức tạp query)
```

## 3.3. Database & JSONB
- **Không tạo bảng theo từng Game**: Dùng duy nhất bảng `accounts` cho mọi tựa game.
- Các thuộc tính đặc thù của game (Rank, Skin, Server) phải được lưu trong trường `account_data` (kiểu dữ liệu **JSONB**).
- Đánh `INDEX` cho các trường thường xuyên truy vấn như `status`, `game_id`, `price`.

## 3.4. API Response Format
Mọi API JSON phải trả về theo chuẩn cấu trúc Envelope:
**Thành công:**
```json
{
    "success": true,
    "message": "Thao tác thành công",
    "data": { ... }
}
```
**Thất bại:**
```json
{
    "success": false,
    "message": "Lỗi xác thực",
    "errors": { "field_name": ["Lý do lỗi"] }
}
```

## 3.5. Security & Permission
- API Admin yêu cầu kiểm tra cả xác thực (Authentication - JWT) lẫn phân quyền (Permissions - Role).
- Không log các thông tin nhạy cảm: `password`, `token`, thông tin đăng nhập của acc game.
- Dữ liệu mật khẩu account game gửi cho khách hàng phải được xử lý bảo mật an toàn.

---

# 4. TEAMWORK & GIT CONVENTIONS

## 4.1. Branch Naming (Tên nhánh)
- Tính năng mới: `feature/ten-tinh-nang`
- Sửa lỗi: `fix/ten-loi`
- Tái cấu trúc: `refactor/ten-module`

## 4.2. Commit Convention (Quy tắc Commit)
Sử dụng cấu trúc: `type(scope): message`
Ví dụ:
- `feat(account): add account filter`
- `fix(payment): momo callback issue`
- `refactor(order): optimize query for order list`

## 4.3. Pull Requests & Code Review
- Viết mô tả rõ ràng về thay đổi.
- Gắn hình ảnh/video UI nếu có thay đổi giao diện.
- Không merge code nếu đang có Conflict hoặc lỗi Build/Test.

---

# 5. CÁC QUY TẮC BỊ CẤM (Forbidden Rules)

❌ **TUYỆT ĐỐI KHÔNG LÀM NHỮNG ĐIỀU SAU:**
1. Hardcode API Base URL trong code (Phải dùng Environment Variables `.env`).
2. Sử dụng kiểu `any` trong TypeScript.
3. Lặp lại (Duplicate) code - Hãy tách thành Helper/Service/Component.
4. Viết CSS dạng inline style (Phải dùng Tailwind classes).
5. Đặt Business Logic (tính toán tiền, gọi third-party API) trực tiếp vào trong `views.py` (Backend) hoặc `UI Component` (Frontend).
6. Commit các file chứa Secret Keys, Token, `.env` lên Git.
7. Upload file từ user mà không Validate giới hạn dung lượng (Max: 5MB) và loại file (chỉ cho phép: `jpg`, `png`, `webp`).
