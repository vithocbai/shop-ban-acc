from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserDetailSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    API Đăng ký tài khoản người dùng mới.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """
    API Lấy và cập nhật thông tin cá nhân của người dùng đang đăng nhập.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
