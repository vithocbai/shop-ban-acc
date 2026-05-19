import api from "../../../services/api";
import type { Game, GameCreateInput, GameUpdateInput } from "../types";

export const gameService = {
    getAllGames: async (): Promise<Game[]> => {
        const response = await api.get("/games/");
        // Nếu API được bọc trong { success: true, data: [...] }
        if (response.data && response.data.data) {
            return response.data.data;
        }
        // Nếu API trả về mảng trực tiếp [...]
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    },

    getGameDetail: async (slug: string): Promise<Game> => {
        const response = await api.get(`/games/${slug}/`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    createGame: async (data: GameCreateInput): Promise<Game> => {
        const response = await api.post("/games/", data);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    updateGame: async (id: number, data: GameUpdateInput): Promise<Game> => {
        const response = await api.put(`/games/${id}/`, data);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    deleteGame: async (id: number): Promise<void> => {
        await api.delete(`/games/${id}/`);
    }
};

