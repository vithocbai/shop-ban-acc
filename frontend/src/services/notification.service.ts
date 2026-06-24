import api from './api';

export interface Notification {
    id: number;
    title: string;
    content: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export const notificationService = {
    /**
     * Lấy danh sách thông báo của user (có phân trang/mặc định)
     */
    getNotifications: async () => {
        const response = await api.get('/notifications/');
        // Bóc tách lớp ResponseEnvelopeMixin. backend trả về { success, data: { items: [...] } }
        return response.data?.data || response.data;
    },

    /**
     * Đánh dấu 1 thông báo là đã đọc
     */
    markAsRead: async (id: number) => {
        const response = await api.post(`/notifications/${id}/read/`);
        return response.data;
    },

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    markAllAsRead: async () => {
        const response = await api.post('/notifications/read-all/');
        return response.data;
    }
};
