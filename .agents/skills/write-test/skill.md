# 🧪 WRITE TEST SKILL

Mô tả kỹ năng sinh và viết mã kiểm thử (Testing Code Generation) độc lập cho Frontend và Backend của AI Agent, bám sát các đầu việc nhỏ lẻ trong `FRONTEND_ADMIN_CHECKLIST.md` và `BACKEND_CHECKLIST.md`.

---

# 1. Hướng Dẫn Viết Test Cho Backend (Backend Testing Code)

AI Agent khi thực hiện viết code kiểm thử cho Backend phải tuân thủ việc tách biệt thành các file kiểm thử nhỏ lẻ tương ứng với từng tác vụ trong `BACKEND_CHECKLIST.md`.

### Công cụ kiểm thử Backend:
*   Framework chính: **pytest** kết hợp với **pytest-django** và **pytest-mock**.
*   Công cụ kiểm thử tích hợp: **Django TestCase** (cho transactional testing).

### Cấu trúc mã test chuẩn:
*   Mỗi API / Service phải có một file test tương ứng trong `tests/` của app đó.
*   Ví dụ:
    *   `src/apps/user/tests/test_services.py` (Test cho service cập nhật số dư, đổi mật khẩu)
    *   `src/apps/user/tests/test_views.py` (Test cho login, register, profile)

#### Ví dụ mẫu viết test cho Service cập nhật số dư (Atomic Balance Update):
```python
import pytest
from django.db import transaction
from django.contrib.auth import get_user_model
from apps.user.services import update_user_balance
from apps.user.exceptions import InsufficientBalanceException

User = get_user_model()

@pytest.mark.django_db
def test_update_user_balance_success():
    user = User.objects.create_user(email="test@gmail.com", password="password123", balance=1000)
    
    # Nạp tiền thành công
    updated_user = update_user_balance(user.id, amount=500, tx_type="DEPOSIT")
    assert updated_user.balance == 1500

@pytest.mark.django_db
def test_update_user_balance_insufficient():
    user = User.objects.create_user(email="test@gmail.com", password="password123", balance=100)
    
    # Rút tiền vượt quá số dư -> Báo lỗi
    with pytest.raises(InsufficientBalanceException):
        update_user_balance(user.id, amount=-200, tx_type="WITHDRAW")
```

---

# 2. Hướng Dẫn Viết Test Cho Frontend (Frontend Testing Code)

AI Agent khi viết test cho Frontend phải giả lập dữ liệu độc lập (Mocking) và kiểm thử chi tiết giao diện người dùng tương ứng với `FRONTEND_ADMIN_CHECKLIST.md`.

### Công cụ kiểm thử Frontend:
*   Framework chính: **Vitest**
*   Hỗ trợ Render & Interaction: **React Testing Library** và `@testing-library/user-event`
*   Mock HTTP Request: **msw** (Mock Service Worker) hoặc **axios-mock-adapter**

### Cấu trúc mã test chuẩn:
*   Tên file test đặt song song với component: `<ComponentName>.test.tsx` hoặc nằm trong thư mục `__tests__/`.

#### Ví dụ mẫu viết test cho LoginForm (Kiểm thử tương tác & Báo lỗi):
```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginForm from "./LoginForm";
import { AuthProvider } from "../../../context/AuthContext";

describe("LoginForm Component", () => {
  it("should show validation error when username is empty", async () => {
    render(
      <AuthProvider>
        <LoginForm onSwitchToRegister={vi.fn()} />
      </AuthProvider>
    );

    // Click nút submit mà không điền thông tin
    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    // Đợi thông báo lỗi validation hiển thị
    await waitFor(() => {
      expect(screen.getByText(/tài khoản không được để trống/i)).toBeInTheDocument();
    });
  });

  it("should show loading state and disable button when submitting", async () => {
    render(
      <AuthProvider>
        <LoginForm onSwitchToRegister={vi.fn()} />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/tài khoản/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText(/mật khẩu/i), { target: { value: "password123" } });
    
    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    // Nút bấm phải chuyển sang trạng thái disabled hoặc hiển thị loading spinner
    expect(screen.getByRole("button", { name: /đang xử lý/i })).toBeDisabled();
  });
});
```

---

# 3. Quy Tắc Cấm Kỵ (Forbidden)

*   **❌ Cấm viết test ảo (Mocking bừa bãi)**: Không mock toàn bộ các assert đến mức test case luôn luôn pass dù code logic bên trong có thay đổi.
*   **❌ Cấm lạm dụng Snapshot Testing**: Hạn chế dùng `toMatchSnapshot()` để test giao diện vì nó dễ gây nhiễu khi cập nhật UI nhỏ. Nên chỉ định chính xác phần tử cần test bằng các hàm `getByRole`, `getByText`, `getByTestId`.
*   **❌ Cấm để rác Database sau khi test**: Với Backend, luôn sử dụng transaction rollback (`@pytest.mark.django_db` hoặc `TestCase`) để reset sạch sẽ dữ liệu sau khi mỗi hàm test hoàn thành.