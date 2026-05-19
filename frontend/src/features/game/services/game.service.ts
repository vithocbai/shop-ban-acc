import api from "../../../services/api";
import type { Game, GameCreateInput, GameUpdateInput } from "../types";
import type { PaginatedResponse, ApiResponse } from "../../../types";

export const gameService = {
    // Lấy danh sách tất cả các Game (hỗ trợ phân trang, tìm kiếm và không phân trang)
    getAllGames: async (params?: { page?: number; page_size?: number; search?: string; no_pagination?: boolean }): Promise<PaginatedResponse<Game>> => {
        const response = await api.get<ApiResponse<PaginatedResponse<Game>>>("/games/", { params });
        
        // Trường hợp 1: Backend trả về cấu hình Envelope chuẩn { success: true, data: { items: [...], total: X } }
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        
        // Trường hợp 2: Dữ liệu thô đã chứa phân trang trực tiếp
        const rawData = response.data as any;
        if (rawData && rawData.items) {
            return rawData;
        }
        
        // Trường hợp 3: Fallback nếu API trả về một mảng thô (không phân trang ở backend)
        if (Array.isArray(response.data)) {
            return {
                items: response.data,
                total: response.data.length,
                page: 1,
                page_size: response.data.length
            };
        }
        
        // Fallback cuối cùng nếu không khớp bất kỳ cấu trúc nào
        return {
            items: [],
            total: 0,
            page: 1,
            page_size: 10
        };
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


