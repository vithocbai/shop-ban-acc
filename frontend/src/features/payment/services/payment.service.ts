import api from "@/services/api";
import type { ApiResponse } from "@/types";

export interface ManualDepositData {
    user_id: number;
    amount: number;
    payment_method: string;
    note?: string;
}

export interface Card {
    id: number;
    code: string;
    serial: string;
    amount: number;
    status: "ACTIVE" | "USED" | "LOCKED";
    created_at: string;
    used_at: string | null;
}

export interface CardFilters {
    status?: string;
    page?: number;
    page_size?: number;
}

export const paymentService = {
    manualDeposit: async (data: ManualDepositData): Promise<any> => {
        const response = await api.post<ApiResponse<any>>("/manual-deposit/", data);
        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || "Nạp tiền thất bại");
    },

    getCards: async (filters: CardFilters = {}): Promise<any> => {
        const params: Record<string, any> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== undefined && value !== null) {
                params[key] = value;
            }
        });

        const response = await api.get<ApiResponse<any>>("/cards/", { params });
        if (response.data && response.data.success) {
            return response.data.data; // should be paginated { items: Card[], total... }
        }
        return { items: [], total: 0, page: 1, page_size: 10 };
    },

    createCardsBatch: async (amount: number, quantity: number): Promise<any> => {
        const response = await api.post<ApiResponse<any>>("/cards/batch_generate/", { amount, quantity });
        // Chấp nhận nếu success=true HOẶC nếu không có field success nhưng có message (HTTP 2xx)
        // Tại sao? Vì một số API endpoint chưa có field success nhất quán, tránh lỗi toast.error nhầm
        if (response.data && (response.data.success === true || response.data.message)) {
            return response.data;
        }
        throw new Error(response.data?.message || "Tạo thẻ thất bại");
    },

    updateCardStatus: async (id: number, status: string): Promise<any> => {
        const response = await api.patch<ApiResponse<any>>(`/cards/${id}/`, { status });
        // Chấp nhận nếu success=true HOẶC không có field success nhưng không phải false (HTTP 2xx)
        // Tại sao? PATCH qua ModelViewSet trả về serialized object, không nhất thiết có field success
        if (response.data && response.data.success !== false) {
            return response.data.data ?? response.data;
        }
        throw new Error(response.data?.message || "Cập nhật thẻ thất bại");
    },

    // Lấy số liệu thống kê từng loại thẻ từ endpoint riêng
    // Tại sao? Tránh phải fetch toàn bộ danh sách (page_size=999999) chỉ để đếm
    getCardStats: async (): Promise<{ total: number; active: number; used: number; locked: number }> => {
        const response = await api.get<ApiResponse<any>>("/cards/stats/");
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return { total: 0, active: 0, used: 0, locked: 0 };
    },

    // Xóa thẻ nạp (chỉ xóa được thẻ chưa sử dụng, backend sẽ validate)
    deleteCard: async (id: number): Promise<void> => {
        const response = await api.delete<ApiResponse<any>>(`/cards/${id}/`);
        // DELETE thành công trả về 204 No Content hoặc 200 với message
        if (response.status === 204 || (response.data && response.data.success !== false)) {
            return;
        }
        throw new Error(response.data?.message || "Xóa thẻ thất bại");
    },
};
