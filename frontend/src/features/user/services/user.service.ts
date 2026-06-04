import api from "@/services/api";
import type { User, UserFilters } from "../types";
import type { ApiResponse, PaginatedResponse } from "@/types";

export const userService = {
    getUsers: async (filters: UserFilters): Promise<PaginatedResponse<User>> => {
        const params: Record<string, any> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== undefined && value !== null) {
                params[key] = value;
            }
        });

        const response = await api.get<ApiResponse<PaginatedResponse<User>>>("/users/", { params });
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        return { items: [], total: 0, page: 1, page_size: 10 };
    },

    getUserDetail: async (id: number): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}/`);
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data as unknown as User;
    },

    createUser: async (data: any): Promise<User> => {
        const response = await api.post(`/users/`, data);
        if (response.data && response.data.email) {
            return response.data;
        }
        return response.data.data || response.data;
    },

    updateUser: async (id: number, data: Partial<User>): Promise<User> => {
        const response = await api.patch<ApiResponse<User>>(`/users/${id}/`, data);
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data?.message || "Cập nhật người dùng thất bại");
    },

    deleteUser: async (id: number): Promise<void> => {
        const response = await api.delete(`/users/${id}/`);
        return response.data;
    },

    updateUserStatus: async (id: number, status: string): Promise<User> => {
        const response = await api.patch<ApiResponse<User>>(`/users/${id}/`, { status });
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data?.message || "Cập nhật trạng thái thất bại");
    },

    updateUserRole: async (id: number, role: string): Promise<User> => {
        const response = await api.patch<ApiResponse<User>>(`/users/${id}/`, { role });
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data?.message || "Cập nhật quyền thất bại");
    },

    updateUserBalance: async (id: number, amount: number, reason: string): Promise<User> => {
        const response = await api.post<ApiResponse<User>>(`/users/${id}/balance/`, { amount, reason });
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data?.message || "Cập nhật số dư thất bại");
    },

    // API đổi  mật khẩu
    updateUserPassword: async (data: any): Promise<any> => {
        const response = await api.post(`/auth/password/change/`, data);
        return response.data;
    }
};
