from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Transaction, Deposit
from .serializers import TransactionSerializer, DepositSerializer
from .services.balance import update_user_balance

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet hiển thị lịch sử giao dịch của người dùng hiện tại.
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class DepositViewSet(viewsets.ModelViewSet):
    """
    ViewSet quản lý yêu cầu nạp tiền.
    - User: Tạo yêu cầu và xem lịch sử của mình.
    - Admin: Duyệt hoặc từ chối yêu cầu.
    """
    serializer_class = DepositSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Deposit.objects.all()
        return Deposit.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """
        API dành cho Admin duyệt nạp tiền.
        Nếu duyệt thành công, cộng tiền vào tài khoản người dùng.
        """
        deposit = self.get_object()
        if deposit.status != Deposit.Status.PENDING:
            return Response({"error": "Yêu cầu này đã được xử lý trước đó."}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            deposit.status = Deposit.Status.APPROVED
            deposit.approved_by = request.user
            deposit.approved_at = timezone.now()
            deposit.admin_note = request.data.get('admin_note', '')
            deposit.save()
            
            # Cộng tiền vào tài khoản user
            update_user_balance(
                user=deposit.user,
                amount=deposit.amount,
                transaction_type=Transaction.Type.DEPOSIT,
                note=f"Nạp tiền từ yêu cầu #{deposit.id} ({deposit.method})",
                metadata={"deposit_id": deposit.id}
            )
            
        return Response({"message": "Đã duyệt nạp tiền thành công!"})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """
        API dành cho Admin từ chối nạp tiền.
        """
        deposit = self.get_object()
        if deposit.status != Deposit.Status.PENDING:
            return Response({"error": "Yêu cầu này đã được xử lý trước đó."}, status=status.HTTP_400_BAD_REQUEST)
            
        deposit.status = Deposit.Status.REJECTED
        deposit.approved_by = request.user
        deposit.admin_note = request.data.get('admin_note', 'Thông tin không hợp lệ.')
        deposit.save()
        
        return Response({"message": "Đã từ chối yêu cầu nạp tiền."})
