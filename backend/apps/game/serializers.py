from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    """
    Serializer cho dữ liệu Game (Public).
    """
    class Meta:
        model = Game
        fields = [
            'id', 'name', 'slug', 'icon', 'banner', 
            'thumbnail', 'description', 'theme_color', 
            'is_hot', 'status', 'attributes_schema'
        ]
        read_only_fields = ['id', 'slug']
