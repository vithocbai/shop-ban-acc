// Interface mô tả cấu trúc dữ liệu phân trang trả về từ Backend
export interface PaginatedResponse<T> {
    items: T[];       // Danh sách các đối tượng thuộc trang hiện tại
    total: number;     // Tổng số lượng đối tượng có trên hệ thống
    page: number;      // Số trang hiện tại
    page_size: number; // Kích thước của mỗi trang (số lượng phần tử tối đa trên một trang)
}

// Interface mô tả Response Envelope tiêu chuẩn của tất cả API
export interface ApiResponse<T> {
    success: boolean;  // Trạng thái thành công của API (true/false)
    message: string;   // Thông báo phản hồi từ Backend (Thành công/Thất bại)
    data: T;           // Dữ liệu payload đi kèm API (có thể là đối tượng đơn hoặc đối tượng phân trang)
}

