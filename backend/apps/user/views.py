from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .serializers import (
    RegisterSerializer, UserDetailSerializer, ChangePasswordSerializer,
    PasswordResetSerializer, PasswordResetConfirmSerializer
)

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


class ChangePasswordView(APIView):
    """
    API Đổi mật khẩu cho người dùng đang đăng nhập.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        
        # Kiểm tra mật khẩu cũ
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": ["Mật khẩu cũ không chính xác."]}, status=status.HTTP_400_BAD_REQUEST)
        
        # Đặt mật khẩu mới
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"message": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """
    API Yêu cầu đặt lại mật khẩu (Gửi Token/Link qua console/email).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            # Tạo Token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Giả lập gửi Email (In ra console trong môi trường Dev)
            print(f"\n--- PASSWORD RESET TOKEN FOR {email} ---")
            print(f"UID: {uid}")
            print(f"TOKEN: {token}")
            print(f"-----------------------------------------\n")
            
            return Response({"message": "Nếu email tồn tại, một mã đặt lại mật khẩu đã được gửi."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Vẫn trả về thành công để bảo mật thông tin (không cho biết email có tồn tại hay không)
            return Response({"message": "Nếu email tồn tại, một mã đặt lại mật khẩu đã được gửi."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """
    API Xác nhận đặt lại mật khẩu bằng Token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Token thường đi kèm với UID được mã hóa
            uid_b64 = request.data.get('uid')
            uid = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=uid)
            
            # Kiểm tra Token hợp lệ
            if default_token_generator.check_token(user, serializer.validated_data['token']):
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response({"message": "Đặt lại mật khẩu thành công!"}, status=status.HTTP_200_OK)
            else:
                return Response({"token": ["Mã xác nhận không hợp lệ hoặc đã hết hạn."]}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Dữ liệu không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)
