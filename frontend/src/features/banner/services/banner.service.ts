import api from "@/services/api";

export interface Banner {
    id: number;
    title: string;
    position: string;
    link_url: string | null;
    sort_order: number;
    image_url: string;
    description: string;
    is_active: boolean;
    devices: string[];
    show_in_home: boolean;
    start_date: string | null;
    end_date: string | null;
    note: string;
    created_at: string;
    updated_at: string;
}

export const bannerService = {
    // Danh sách banner
    getBanners: async (params?: Record<string, any>) => {
        const response = await api.get("/banners/", { params });
        return response.data?.data || response.data;
    },

    // Chi tiết banner
    getBannerById: async (id: number) => {
        const response = await api.get(`/banners/${id}/`);
        return response.data?.data || response.data;
    },

    // Tạo banner
    createBanner: async (data: Partial<Banner>) => {
        const response = await api.post("/banners/", data);
        return response.data?.data || response.data;
    },

    // Cập nhật banner
    updateBanner: async (id: number, data: Partial<Banner>) => {
        const response = await api.patch(`/banners/${id}/`, data);
        return response.data?.data || response.data;
    },

    // Xóa banner
    deleteBanner: async (id: number) => {
        const response = await api.delete(`/banners/${id}/`);
        return response.data;
    }
};
