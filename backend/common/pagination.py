from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

# Lớp phân trang chuẩn cho toàn hệ thống API
class StandardResultsSetPagination(PageNumberPagination):
    # Số lượng bản ghi mặc định trên mỗi trang
    page_size = 20
    # Tham số query param để client có thể tùy chỉnh kích thước trang (ví dụ: ?page_size=20)
    page_size_query_param = 'page_size'
    # Giới hạn số lượng bản ghi tối đa trên một trang để tránh quá tải hệ thống
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        # Nếu client truyền query param no_pagination=true (ví dụ như lúc load danh sách vào dropdown),
        # hệ thống sẽ trả về toàn bộ dữ liệu mà không thực hiện phân trang.
        if request.query_params.get('no_pagination', '').lower() == 'true':
            return None
        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        return Response({
            "success": True,
            "message": "Lấy danh sách thành công",
            "data": {
                "items": data,  # Mảng chứa danh sách các bản ghi của trang hiện tại
                "total": self.page.paginator.count,  # Tổng số lượng bản ghi trên toàn hệ thống
                "page": self.page.number,  # Số trang hiện tại
                "page_size": self.get_page_size(self.request)  # Kích thước trang hiện tại
            }
        })

