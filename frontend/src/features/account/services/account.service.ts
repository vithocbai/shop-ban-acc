import api from "../../../services/api";
import type { Account, AccountCreateInput, AccountUpdateInput } from "../types";
import type { PaginatedResponse, ApiResponse } from "../../../types";

export const accountService = {
    /**
     * Lấy danh sách tài khoản game (hỗ trợ phân trang, tìm kiếm, lọc)
     */
    getAllAccounts: async (params?: {
        page?: number;
        page_size?: number;
        search?: string;
        game?: number;
        status?: string;
    }): Promise<PaginatedResponse<Account>> => {
        const response = await api.get<ApiResponse<PaginatedResponse<Account>>>("/accounts/", { params });

        // Trường hợp 1: Backend trả về cấu hình Envelope chuẩn
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }

        // Trường hợp 2: Dữ liệu thô đã chứa phân trang trực tiếp
        const rawData = response.data as any;
        if (rawData && rawData.items) {
            return rawData;
        }

        // Trường hợp 3: Fallback nếu API trả về một mảng thô
        if (Array.isArray(response.data)) {
            return {
                items: response.data,
                total: response.data.length,
                page: 1,
                page_size: response.data.length
            };
        }

        return { items: [], total: 0, page: 1, page_size: 10 };
    },

    /**
     * Lấy chi tiết một tài khoản game theo ID
     */
    getAccountDetail: async (id: number): Promise<Account> => {
        const response = await api.get(`/accounts/${id}/`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    /**
     * Tạo mới một tài khoản game
     */
    createAccount: async (data: AccountCreateInput): Promise<Account> => {
        const response = await api.post("/accounts/", data);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    /**
     * Cập nhật thông tin tài khoản game
     */
    updateAccount: async (id: number, data: AccountUpdateInput): Promise<Account> => {
        const response = await api.put(`/accounts/${id}/`, data);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    /**
     * Xóa mềm một tài khoản game theo ID
     */
    deleteAccount: async (id: number): Promise<void> => {
        await api.delete(`/accounts/${id}/`);
    }
};
