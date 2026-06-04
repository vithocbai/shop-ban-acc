export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN" | "MODERATOR";
export type UserStatus = "ACTIVE" | "BANNED" | "PENDING";

export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
    phone: string | null;
    balance: string | number;
    role: UserRole;
    status: UserStatus;
    email_verified: boolean;
    date_joined: string;
    last_login: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserFilters {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    page_size?: number;
}
