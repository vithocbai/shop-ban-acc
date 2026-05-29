import type { Account } from "../account/types";


export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type DeliveryStatus = "PENDING" | "DELIVERED" | "FAILED";

export interface OrderUser {
    id: number;
    username: string;
    email: string;
}

export interface OrderItem {
    id: number;
    account: Account;
    price: string | number;
    delivery_data: Record<string, any>;
}

export interface Order {
    id: number;
    order_code: string;
    user: OrderUser;
    total_price: string | number;
    payment_status: PaymentStatus;
    delivery_status: DeliveryStatus;
    note: string;
    items: OrderItem[];
    created_at: string;
}

export interface OrderFilters {
    search?: string;
    payment_status?: string;
    delivery_status?: string;
    page?: number;
    page_size?: number;
}
