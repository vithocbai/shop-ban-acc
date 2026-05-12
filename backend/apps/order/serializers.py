from rest_framework import serializers
from .models import Order, OrderItem
from apps.account.serializers import AccountListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    account = AccountListSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'account', 'price', 'delivery_data']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_code', 'total_price', 'payment_status', 
            'delivery_status', 'note', 'items', 'created_at'
        ]
        read_only_fields = ['id', 'order_code', 'total_price', 'created_at']

class CheckoutSerializer(serializers.Serializer):
    """
    Serializer để nhận yêu cầu mua hàng.
    """
    account_id = serializers.IntegerField()
    note = serializers.CharField(required=False, allow_blank=True)
