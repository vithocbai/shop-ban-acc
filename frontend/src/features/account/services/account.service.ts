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
        const response = await api.get<ApiResponse<any>>("/accounts/", { params });

        if (response.data && response.data.success && response.data.data) {
            const data = response.data.data;
            
            // Nếu data là mảng (trường hợp no_pagination=true)
            if (Array.isArray(data)) {
                return {
                    items: data,
                    total: data.length,
                    page: 1,
                    page_size: data.length
                };
            }
            
            return data as PaginatedResponse<Account>;
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
