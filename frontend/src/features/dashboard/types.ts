
export interface SummaryCards {
    total_revenue: number;
    total_orders: number;
    accounts_sold: number;
    new_users: number;
    total_deposits: number;
}

export interface RevenueChart {
    date: string;
    revenue: number;
    orders: number;
}

export interface QuickStats {
    selling_accounts: number;
    sold_accounts: number;
    locked_accounts: number;
    hidden_accounts: number;
}

export interface RecentOrder {
    order_code: string;
    customer: string;
    value: number;
    status: string;
    time: string;
}

export interface GameBreakdown {
    name: string;
    value: number;
}

export interface OverviewData {
    summary_cards: SummaryCards | null;
    revenue_chart: RevenueChart[] | null;
    game_breakdown?: GameBreakdown[] | null;
    quick_stats: QuickStats | null;
}

export interface LiveData {
    recent_orders: RecentOrder[] | null;
    online_users: number;
}
