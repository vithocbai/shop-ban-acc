import api from "../../../services/api";
import type { Game, GameCreateInput, GameUpdateInput } from "../types";

export const gameService = {
    getAllGames: async (): Promise<Game[]> => {
        const response = await api.get("/games/");
        return response.data.data;
    },

    getGameDetail: async (slug: string): Promise<Game> => {
        const response = await api.get(`/games/${slug}/`);
        return response.data.data;
    },

    createGame: async (data: GameCreateInput): Promise<Game> => {
        const response = await api.post("/games/", data);
        return response.data.data;
    },

    updateGame: async (id: number, data: GameUpdateInput): Promise<Game> => {
        const response = await api.put(`/games/${id}/`, data);
        return response.data.data;
    },

    deleteGame: async (id: number): Promise<void> => {
        await api.delete(`/games/${id}/`);
    }
};
