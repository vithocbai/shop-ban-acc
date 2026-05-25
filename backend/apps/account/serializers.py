from rest_framework import serializers
from .models import Account, AccountImage
from apps.game.serializers import GameSerializer

class AccountImageSerializer(serializers.ModelSerializer):
    """
    Serializer cho bộ sưu tập ảnh của tài khoản.
    """
    class Meta:
        model = AccountImage
        fields = ['id', 'image_url', 'sort_order']


class AccountListSerializer(serializers.ModelSerializer):
    """
    Serializer rút gọn dùng cho danh sách trang chủ/danh mục.
    """
    game_name = serializers.CharField(source='game.name', read_only=True)
    
    class Meta:
        model = Account
        fields = [
            'id', 'game', 'game_name', 'title', 'slug', 
            'account_code', 'thumbnail', 'price', 
            'original_price', 'discount_percent', 'status',
            'is_hot', 'is_featured', 'account_data',
            'views', 'created_at'
        ]


class AccountDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ dùng cho trang chi tiết tài khoản.
    """
    game = GameSerializer(read_only=True)
    images = AccountImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Account
        fields = [
            'id', 'game', 'title', 'slug', 'account_code', 
            'thumbnail', 'price', 'original_price', 
            'discount_percent', 'status', 'login_type', 
            'account_type', 'short_description', 'description', 
            'account_data', 'images', 'is_featured', 'is_hot',
            'views', 'sold_at', 'created_by', 'created_at', 'updated_at'
        ]


class AccountImageWriteSerializer(serializers.ModelSerializer):
    """
    Serializer cho phép tạo/cập nhật ảnh tài khoản.
    """
    class Meta:
        model = AccountImage
        fields = ['id', 'image_url', 'sort_order']
        extra_kwargs = {
            'id': {'read_only': True}
        }


class AccountWriteSerializer(serializers.ModelSerializer):
    """
    Serializer dùng cho Admin tạo mới và cập nhật tài khoản game.
    Nhận game dưới dạng game_id (PrimaryKeyRelatedField).
    Hỗ trợ tạo/cập nhật ảnh gallery lồng (nested images).
    """
    images = AccountImageWriteSerializer(many=True, required=False)

    class Meta:
        model = Account
        fields = [
            'id', 'game', 'title', 'slug', 'account_code',
            'thumbnail', 'price', 'original_price',
            'discount_percent', 'status', 'login_type',
            'account_type', 'short_description', 'description',
            'account_data', 'is_featured', 'is_hot', 'images'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'slug': {'required': False},
        }

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        account = Account.objects.create(**validated_data)
        for image_data in images_data:
            AccountImage.objects.create(account=account, **image_data)
        return account

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        
        # Cập nhật các trường cố định của Account
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Nếu có gửi kèm danh sách images mới, xóa hết cũ và tạo lại
        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                AccountImage.objects.create(account=instance, **image_data)

        return instance
