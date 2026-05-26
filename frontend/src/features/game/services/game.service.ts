import api from "../../../services/api";
import type { Game, GameCreateInput, GameUpdateInput } from "../types";
import type { PaginatedResponse, ApiResponse } from "../../../types";

export const gameService = {
    // Lấy danh sách tất cả các Game (hỗ trợ phân trang, tìm kiếm và không phân trang)
    getAllGames: async (params?: { page?: number; page_size?: number; search?: string; no_pagination?: boolean }): Promise<PaginatedResponse<Game>> => {
        const response = await api.get<ApiResponse<any>>("/games/", { params });
        
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
            
            // Nếu data là object phân trang (có items, total, ...)
            return data as PaginatedResponse<Game>;
        }
        
        return { items: [], total: 0, page: 1, page_size: 10 };
    },

    // Lấy chi tiết thông tin một Game theo slug
    getGameDetail: async (slug: string): Promise<Game> => {
        const response = await api.get(`/games/${slug}/`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    // Tạo mới một Game
    createGame: async (data: GameCreateInput): Promise<Game> => {
        const response = await api.post("/games/", data);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    // Cập nhật thông tin Game
    updateGame: async (id: number, data: GameUpdateInput): Promise<Game> => {
        const response = await api.put(`/games/${id}/`, data);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    // Xóa mềm/xóa một Game theo id
    deleteGame: async (id: number): Promise<void> => {
        await api.delete(`/games/${id}/`);
    }
};


