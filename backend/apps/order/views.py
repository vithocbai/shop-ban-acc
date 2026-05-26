from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer, CheckoutSerializer
from .services.purchase import purchase_account
from common.mixins import ResponseEnvelopeMixin

class OrderViewSet(ResponseEnvelopeMixin, viewsets.ReadOnlyModelViewSet):
    """
    ViewSet quản lý đơn hàng.
    - list/retrieve: Xem lịch sử đơn hàng của User.
    - checkout: Thực hiện mua tài khoản.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user).prefetch_related('items__account')

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        """
        API thực hiện mua tài khoản game.
        """
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        account_id = serializer.validated_data['account_id']
        note = serializer.validated_data.get('note', '')
        
        # Gọi service xử lý mua hàng
        order = purchase_account(
            user=request.user,
            account_id=account_id,
            note=note
        )
        
        return Response(
            OrderSerializer(order).data, 
            status=status.HTTP_201_CREATED
        )
