from rest_framework import serializers
from .models import Account, AccountImage
from apps.games.serializers import GameSerializer

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
            'is_hot', 'is_featured', 'account_data'
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
            'account_data', 'images', 'views', 'created_at'
        ]
