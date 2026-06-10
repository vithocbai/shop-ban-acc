import api from "@/services/api";

export interface Category {
    id: number;
    title: string;
    slug: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Author {
    id: number;
    fullName: string;
}

export interface Article {
    id: number;
    title: string;
    slug: string;
    category: Category | null;
    category_id?: number | null;
    author: Author;
    thumbnail: string | null;
    short_description: string;
    content?: string; // Only available in Detail response
    status: "DRAFT" | "PUBLISHED";
    is_visible: boolean;
    published_at: string | null;
    display_until: string | null;
    priority: number;
    meta_title?: string;
    meta_description?: string;
    view_count: number;
    created_at: string;
    updated_at?: string;
}

export const newsService = {
    // Categories
    getCategories: async () => {
        const response = await api.get("/news/categories/");
        return response.data?.data?.items || response.data?.results || response.data || [];
    },
    createCategory: async (data: Partial<Category>) => {
        const response = await api.post("/news/categories/", data);
        return response.data?.data || response.data;
    },
    updateCategory: async (id: number, data: Partial<Category>) => {
        const response = await api.patch(`/news/categories/${id}/`, data);
        return response.data?.data || response.data;
    },
    deleteCategory: async (id: number) => {
        const response = await api.delete(`/news/categories/${id}/`);
        return response.data;
    },

    // Articles
    getArticles: async (params?: Record<string, any>) => {
        const response = await api.get("/news/articles/", { params });
        return response.data?.data || response.data;
    },

    getArticleById: async (id: number) => {
        const response = await api.get(`/news/articles/${id}/`);
        return response.data?.data || response.data;
    },

    createArticle: async (data: Partial<Article>) => {
        const response = await api.post("/news/articles/", data);
        return response.data?.data || response.data;
    },

    updateArticle: async (id: number, data: Partial<Article>) => {
        const response = await api.patch(`/news/articles/${id}/`, data);
        return response.data?.data || response.data;
    },

    deleteArticle: async (id: number) => {
        const response = await api.delete(`/news/articles/${id}/`);
        return response.data;
    }
};
