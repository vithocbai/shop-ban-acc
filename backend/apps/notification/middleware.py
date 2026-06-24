from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import jwt
from django.conf import settings

User = get_user_model()

@database_sync_to_async
def get_user(validated_token):
    try:
        user = User.objects.get(id=validated_token["user_id"])
        return user
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    """
    Middleware xác thực WebSocket sử dụng JWT truyền qua query_string ?token=<jwt_token>
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_dict = parse_qs(query_string)
        token = query_dict.get("token")
        
        scope["user"] = AnonymousUser()

        if token:
            try:
                # Kiểm tra tính hợp lệ của token (hết hạn, sai chữ ký...)
                UntypedToken(token[0])
                # Giải mã tay để lấy payload vì UntypedToken không trả về đối tượng dễ đọc payload
                decoded_data = jwt.decode(token[0], settings.SECRET_KEY, algorithms=["HS256"])
                scope["user"] = await get_user(decoded_data)
            except (InvalidToken, TokenError, jwt.ExpiredSignatureError, jwt.DecodeError) as e:
                pass
                
        return await self.inner(scope, receive, send)
