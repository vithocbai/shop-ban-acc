import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class ImageUploadView(APIView):
    """
    API endpoint to handle image uploads and return a public URL.
    Only authenticated users (admins) can upload.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "Không tìm thấy file tải lên"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (e.g. 5MB max)
        if file_obj.size > 5 * 1024 * 1024:
            return Response({"error": "Dung lượng file tối đa là 5MB"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Validate file type (only allow common image extensions)
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']:
            return Response({"error": "Chỉ hỗ trợ tải lên các định dạng ảnh (.jpg, .jpeg, .png, .gif, .webp, .svg)"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate a unique name
        unique_name = f"{uuid.uuid4()}{ext}"
        
        # Save file to media/uploads/
        path = default_storage.save(f"uploads/{unique_name}", ContentFile(file_obj.read()))
        
        # Build full URL
        file_url = request.build_absolute_uri(settings.MEDIA_URL + path)
        
        return Response({
            "url": file_url,
            "filename": unique_name
        }, status=status.HTTP_201_CREATED)
