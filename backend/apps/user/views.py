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

# --- Admin API Views ---
from django.db.models import Q
from django.db import transaction
from common.pagination import StandardResultsSetPagination
from apps.payment.models import Transaction
from .serializers import AdminUserSerializer, UpdateBalanceSerializer
import uuid

class UserListAdminView(generics.ListAPIView):
    """
    API Lấy danh sách người dùng dành cho Admin (Có phân trang, lọc, tìm kiếm).
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminUserSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(email__icontains=search) | Q(username__icontains=search))
            
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
            
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset


class UserDetailAdminView(generics.RetrieveUpdateAPIView):
    """
    API Xem chi tiết và cập nhật người dùng (Role, Status) dành cho Admin.
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response({
            "success": True,
            "message": "Cập nhật thành công",
            "data": response.data
        })


class UserBalanceUpdateView(APIView):
    """
    API Cộng/Trừ số dư thủ công dành cho Admin.
    """
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"success": False, "message": "Không tìm thấy người dùng"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = UpdateBalanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        reason = serializer.validated_data['reason']
        
        with transaction.atomic():
            user = User.objects.select_for_update().get(pk=pk)
            balance_before = user.balance
            
            user.balance += amount
            if user.balance < 0:
                 return Response({"success": False, "message": "Số dư không đủ để trừ."}, status=status.HTTP_400_BAD_REQUEST)
                 
            user.save()
            
            trans_type = Transaction.Type.DEPOSIT if amount > 0 else Transaction.Type.WITHDRAW
            Transaction.objects.create(
                user=user,
                transaction_code=f"MANUAL_{uuid.uuid4().hex[:8].upper()}",
                type=trans_type,
                amount=abs(amount),
                balance_before=balance_before,
                balance_after=user.balance,
                status=Transaction.Status.SUCCESS,
                note=f"Admin thao tác: {reason}"
            )
            
        return Response({
            "success": True,
            "message": "Cập nhật số dư thành công",
            "data": AdminUserSerializer(user).data
        })
