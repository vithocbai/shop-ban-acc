from rest_framework import serializers
from .models import Transaction, Deposit, Card

class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer hiển thị lịch sử giao dịch.
    """
    user = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_code', 'type', 'amount', 
            'balance_before', 'balance_after', 'status', 
            'note', 'payment_method', 'user','created_at'
        ]
        read_only_fields = ['id', 'transaction_code', 'created_at']

    def get_user(self, obj):
        if not obj.user:
            return None
        return {"id": obj.user.id, "username": obj.user.username, "email": obj.user.email}

class DepositUserSerializer(serializers.Serializer):
    """Serializer nhúng inline để trả thông tin người dùng trong deposit list"""
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()


class DepositSerializer(serializers.ModelSerializer):
    """
    Serializer cho yêu cầu nạp tiền.
    Trả thêm: user (nested), approved_by (nested), fee, net_amount.
    Tại sao cần fee/net_amount? Để trang lịch sử admin hiển thị đầy đủ không cần tính lại ở FE.
    """
    # Nested user info — dùng SerializerMethodField thay vì nested serializer để tránh lỗi khi user bị xóa
    user = serializers.SerializerMethodField()
    approved_by = serializers.SerializerMethodField()

    # coerce_to_string=False → trả về number thay vì string "100000.00"
    # Tại sao DRF mặc định trả string? Để bảo toàn độ chính xác Decimal (tránh lỗi float 0.1+0.2=0.30000...4)
    # Nhưng với tiền VNĐ (số nguyên, không có phần thập phân thực sự) thì number là đủ và FE dễ dùng hơn
    amount = serializers.DecimalField(max_digits=18, decimal_places=2, coerce_to_string=False)

    # Phí giao dịch: hiện tại = 0 (hệ thống chưa thu phí), sẵn sàng mở rộng sau
    fee = serializers.SerializerMethodField()
    # Thực nhận = amount - fee
    net_amount = serializers.SerializerMethodField()

    class Meta:
        model = Deposit
        fields = [
            'id', 'user', 'amount', 'fee', 'net_amount',
            'method', 'transaction_image',
            'note', 'admin_note', 'status',
            'approved_by', 'approved_at', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'admin_note', 'created_at']

    def get_user(self, obj):
        if not obj.user:
            return None
        return {"id": obj.user.id, "username": obj.user.username, "email": obj.user.email}

    def get_approved_by(self, obj):
        if not obj.approved_by:
            return None
        return {"id": obj.approved_by.id, "username": obj.approved_by.username}

    def get_fee(self, obj):
        # Tại sao = 0? Hệ thống chưa thu phí nạp tiền, trả về 0 để FE luôn có field này
        return 0

    def get_net_amount(self, obj):
        # Thực nhận = số tiền nạp - phí (hiện tại phí = 0)
        return float(obj.amount)

    def create(self, validated_data):
        # Tự động gán user hiện tại khi user tự tạo deposit request
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
