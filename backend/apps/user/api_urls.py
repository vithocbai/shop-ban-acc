from django.urls import path
from .views import UserListAdminView, UserDetailAdminView, UserBalanceUpdateView, AdminResetUserPasswordView

urlpatterns = [
    # Danh sách và tạo người dùng (Admin)
    path('', UserListAdminView.as_view(), name='admin_user_list'),
    
    # Chi tiết và cập nhật cơ bản (Role, Status)
    path('<int:pk>/', UserDetailAdminView.as_view(), name='admin_user_detail'),
    
    # Cập nhật số dư thủ công
    path('<int:pk>/balance/', UserBalanceUpdateView.as_view(), name='admin_user_balance_update'),

    # Admin đặt lại mật khẩu người dùng
    path('<int:pk>/password/', AdminResetUserPasswordView.as_view(), name='admin_user_password_reset'),
]
