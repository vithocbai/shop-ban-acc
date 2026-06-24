import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        # Nếu chưa đăng nhập (token sai hoặc không có), từ chối kết nối
        if self.user.is_anonymous:
            await self.close()
            return
            
        # Group chung cho user này
        self.user_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        
        # Nếu là Admin thì add thêm vào group admins
        if self.user.is_staff:
            await self.channel_layer.group_add("admins", self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
            if self.user.is_staff:
                await self.channel_layer.group_discard("admins", self.channel_name)

    # Receive message from room group
    async def notification_message(self, event):
        # Hàm này nhận data từ group_send, sau đó đẩy JSON xuống Frontend
        notification_data = event["data"]
        await self.send(text_data=json.dumps({
            "type": "new_notification",
            "data": notification_data
        }))
