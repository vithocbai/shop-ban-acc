from rest_framework import serializers
from .models import Transaction, Deposit, Card

class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer hiển thị lịch sử giao dịch.
    """
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_code', 'type', 'amount', 
            'balance_before', 'balance_after', 'status', 
            'note', 'created_at'
        ]
        read_only_fields = ['id', 'transaction_code', 'created_at']

class DepositSerializer(serializers.ModelSerializer):
    """
    Serializer cho yêu cầu nạp tiền.
    """
    class Meta:
        model = Deposit
        fields = [
            'id', 'amount', 'method', 'transaction_image', 
            'note', 'admin_note', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'admin_note', 'created_at']

    def create(self, validated_data):
        # Tự động gán user hiện tại
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CardAdminSerializer(serializers.ModelSerializer):
    """Serializer dành cho Admin quản lý thẻ nạp"""
    class Meta:
        model = Card
        fields = ['id', 'code', 'serial', 'amount', 'status', 'created_at', 'used_at']

class CardBatchCreateSerializer(serializers.Serializer):
    """Serializer để validate payload tạo thẻ hàng loạt"""
    quantity = serializers.IntegerField(min_value=1, max_value=1000)
    amount = serializers.DecimalField(max_digits=18, decimal_places=2, min_value=10000)

class ManualDepositSerializer(serializers.Serializer):
    """Serializer cho việc Admin nạp tiền thủ công cho người dùng"""
    user_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=18, decimal_places=2, min_value=1000)
    payment_method = serializers.CharField(max_length=50)
    note = serializers.CharField(max_length=255, required=False, allow_blank=True)

class CardRedeemSerializer(serializers.Serializer):
    """Serializer để user nạp thẻ bằng mã và serial"""
    code = serializers.CharField(max_length=50)
    serial = serializers.CharField(max_length=50)
