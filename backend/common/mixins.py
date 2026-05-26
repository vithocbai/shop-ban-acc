from rest_framework.response import Response

class ResponseEnvelopeMixin:
    """
    Mixin đảm bảo API trả về đúng chuẩn Envelope Format theo quy định.
    Áp dụng cho hàm list() của các ViewSet.
    Dù có phân trang hay không (no_pagination=true), response luôn có dạng:
    {
        "success": True,
        "message": "...",
        "data": [...] hoặc { "items": [...], ... }
    }
    """
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Thử phân trang
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # Trả về Envelope chuẩn khi không phân trang
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Lấy danh sách thành công",
            "data": serializer.data
        })
