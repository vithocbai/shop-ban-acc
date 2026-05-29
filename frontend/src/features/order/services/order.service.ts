import api from "@/services/api";
import type { Order, OrderFilters } from "../types";
import type { ApiResponse, PaginatedResponse } from "@/types";


export const orderService = {
    getOrders: async (filters: OrderFilters): Promise<PaginatedResponse<Order>> => {
        // Lọc bỏ các params empty
        const params: Record<string, any> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== undefined && value !== null) {
                params[key] = value;
            }
        });

        const response = await api.get<ApiResponse<PaginatedResponse<Order>>>("/orders/", { params });
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        return { items: [], total: 0, page: 1, page_size: 10 };
    },

    getOrderDetail: async (id: number): Promise<Order> => {
        const response = await api.get<ApiResponse<Order>>(`/orders/${id}/`);
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data as unknown as Order;
    },
};
