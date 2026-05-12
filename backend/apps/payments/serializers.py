from rest_framework import serializers
from .models import Transaction, Deposit

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
