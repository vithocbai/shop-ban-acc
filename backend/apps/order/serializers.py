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
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_code', 'user', 'total_price', 'payment_status', 
            'delivery_status', 'note', 'items', 'created_at'
        ]
        read_only_fields = ['id', 'order_code', 'user', 'total_price', 'created_at']

    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email
            }
        return None

class CheckoutSerializer(serializers.Serializer):
    """
    Serializer để nhận yêu cầu mua hàng.
    """
    account_id = serializers.IntegerField()
    note = serializers.CharField(required=False, allow_blank=True)
