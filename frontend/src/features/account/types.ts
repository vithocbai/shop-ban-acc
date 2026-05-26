export type AccountStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "LOCKED" | "HIDDEN";

export interface AccountImage {
    id: number;
    image_url: string;
    sort_order: number;
}

export interface Account {
    id: number;
    game: number;
    game_name: string;
    title: string;
    slug: string;
    account_code: string;
    thumbnail?: string;
    price: number;
    original_price?: number;
    discount_percent: number;
    status: AccountStatus;
    login_type?: string;
    account_type?: string;
    short_description?: string;
    description?: string;
    account_data: Record<string, any>;
    images?: AccountImage[];
    is_featured: boolean;
    is_hot: boolean;
    views: number;
    sold_at?: string;
    created_by?: number;
    created_at: string;
    updated_at?: string;
}

export interface AccountCreateInput {
    game: number;
    title: string;
    slug: string;
    account_code: string;
    thumbnail?: string;
    price: number;
    original_price?: number;
    discount_percent?: number;
    status?: AccountStatus;
    login_type?: string;
    account_type?: string;
    short_description?: string;
    description?: string;
    account_data?: Record<string, any>;
    is_featured?: boolean;
    is_hot?: boolean;
    images?: { image_url: string; sort_order: number }[];
}

export interface AccountUpdateInput extends Partial<AccountCreateInput> {}
