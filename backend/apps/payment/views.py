from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Transaction, Deposit, Card
from .serializers import (
    TransactionSerializer, DepositSerializer, CardAdminSerializer, 
    CardBatchCreateSerializer, ManualDepositSerializer, CardRedeemSerializer
)
from .services.balance import update_user_balance
from apps.notification.services.notifier import notify_user
from apps.notification.models import Notification
from common.mixins import ResponseEnvelopeMixin

class TransactionViewSet(ResponseEnvelopeMixin, viewsets.ReadOnlyModelViewSet):
    """
    ViewSet hiển thị lịch sử giao dịch của người dùng hiện tại.
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
            
        # Thêm filter cơ bản
        type_param = self.request.query_params.get('type')
        if type_param:
            queryset = queryset.filter(type=type_param)
            
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset


class DepositViewSet(ResponseEnvelopeMixin, viewsets.ModelViewSet):
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
            
            # Gửi thông báo
            notify_user(
                user=deposit.user,
                title="Nạp tiền thành công",
                content=f"Yêu cầu nạp {deposit.amount:,.0f}đ của bạn đã được duyệt. Số dư đã được cập nhật.",
                n_type=Notification.Type.PAYMENT
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

class CardAdminViewSet(ResponseEnvelopeMixin, viewsets.ModelViewSet):
    """
    API dành cho Admin quản lý thẻ nạp.
    """
    serializer_class = CardAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Card.objects.all()
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    @action(detail=False, methods=['post'])
    def batch_generate(self, request):
        """API Admin sinh mã thẻ hàng loạt"""
        serializer = CardBatchCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        quantity = serializer.validated_data['quantity']
        amount = serializer.validated_data['amount']
        
        from .services.card import generate_cards
        cards = generate_cards(quantity, amount, request.user)
        
        return Response({
            "success": True,  # Thêm field này để frontend phân biệt thành công/thất bại
            "message": f"Tạo thành công {len(cards)} thẻ nạp mệnh giá {amount:,.0f}đ.",
        })

    def destroy(self, request, *args, **kwargs):
        """
        Xóa thẻ nạp.
        Tại sao override? Để chặn xóa thẻ đã dùng (USED) — tránh mất dữ liệu lịch sử giao dịch.
        """
        card = self.get_object()
        if card.status == Card.Status.USED:
            return Response(
                {"success": False, "message": "Không thể xóa thẻ đã được sử dụng."},
                status=status.HTTP_400_BAD_REQUEST
            )
        card.delete()
        return Response({"success": True, "message": "Đã xóa thẻ thành công."}, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        """
        Cập nhật một phần thông tin thẻ (thường dùng để đổi status).
        Tại sao override? Để chặn kích hoạt lại (ACTIVE/LOCKED) thẻ đã USED —
        tránh tình trạng thẻ đã dùng bị dùng lại.
        """
        card = self.get_object()
        new_status = request.data.get('status')
        
        if new_status and card.status == Card.Status.USED:
            return Response(
                {"success": False, "message": "Không thể thay đổi trạng thái thẻ đã sử dụng."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        """API Khóa thẻ (không cho nạp)"""
        card = self.get_object()
        if card.status == Card.Status.USED:
            return Response({"success": True, "message": "Đã khóa thẻ thành công."}, status=status.HTTP_200_OK)
            
        card.status = Card.Status.LOCKED
        card.save()
        return Response({"message": "Đã khóa thẻ thành công."})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        API trả về số liệu thống kê thẻ theo từng trạng thái.
        Tại sao cần endpoint riêng? Vì nếu frontend cần đếm tổng, đếm theo status,
        không thể dựa vào danh sách đã phân trang → sẽ sai.
        Dùng annotate + values trực tiếp trên DB: chỉ 1 query, không tải toàn bộ objects.
        """
        from django.db.models import Count
        counts = Card.objects.values('status').annotate(count=Count('id'))
        result = {"total": 0, "active": 0, "used": 0, "locked": 0}
        for row in counts:
            count = row['count']
            result['total'] += count
            status_key = row['status'].lower()
            if status_key in result:
                result[status_key] = count
        return Response({"success": True, "data": result})


from rest_framework.views import APIView
from django.contrib.auth import get_user_model
User = get_user_model()

class ManualDepositAdminView(APIView):
    """
    API dành cho Admin nạp tiền thủ công cho người dùng (Tra cứu -> Nạp tiền).
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = ManualDepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_id = serializer.validated_data['user_id']
        amount = serializer.validated_data['amount']
        payment_method = serializer.validated_data['payment_method']
        note = serializer.validated_data.get('note', '')
        
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"success": False, "message": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        
        with transaction.atomic():
            # Tạo Deposit record trước để lưu lịch sử nạp tiền trong /api/deposits/
            # Tại sao? ManualDepositAdminView trước đây chỉ gọi update_user_balance (tạo Transaction)
            # nhưng không tạo Deposit → lịch sử nạp tiền ở trang admin không có dữ liệu.
            deposit = Deposit.objects.create(
                user=user,
                amount=amount,
                method=payment_method,
                note=note,
                admin_note=f"Nạp thủ công bởi {request.user.username}",
                status=Deposit.Status.APPROVED,
                approved_by=request.user,
                approved_at=timezone.now(),
            )
            
            update_user_balance(
                user=user,
                amount=amount,
                transaction_type=Transaction.Type.DEPOSIT,
                note=f"Nạp thủ công: {note}",
                metadata={"admin_id": request.user.id, "payment_method": payment_method, "deposit_id": deposit.id}
            )
        
        notify_user(
            user=user,
            title="Nạp tiền thành công",
            content=f"Admin đã nạp {amount:,.0f}đ vào tài khoản của bạn.",
            n_type=Notification.Type.PAYMENT
        )
        
        return Response({
            "success": True,
            "message": f"Nạp tiền thành công cho {user.email}",
        })

class CardRedeemView(APIView):
    """
    API dành cho người dùng nhập mã và serial để nạp tiền.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CardRedeemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code']
        serial = serializer.validated_data['serial']
        
        from .services.card import redeem_card
        try:
            card = redeem_card(request.user, code, serial)
            notify_user(
                user=request.user,
                title="Đổi thẻ thành công",
                content=f"Bạn đã nạp thành công thẻ cào mệnh giá {card.amount:,.0f}đ.",
                n_type=Notification.Type.PAYMENT
            )
            return Response({
                "success": True,
                "message": f"Nạp thẻ thành công! Tài khoản được cộng {card.amount:,.0f}đ."
            })
        except ValueError as e:
            return Response({
                "success": False,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
