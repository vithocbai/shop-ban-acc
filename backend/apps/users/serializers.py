from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer hiển thị thông tin chi tiết người dùng.
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'avatar', 
            'phone', 'balance', 'role', 'status', 
            'email_verified', 'date_joined'
        ]
        read_only_fields = ['id', 'balance', 'role', 'status', 'date_joined']

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer cho việc đăng ký tài khoản mới.
    """
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'confirm_password']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Mật khẩu xác nhận không khớp."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user
