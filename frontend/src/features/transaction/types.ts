export interface Transaction {
    id: number;
    transaction_code: string;
    type: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    status: string;
    user: { id: number; username: string; email: string } | null;
    payment_method: string;
    note: string;
    created_at: string;
}

export interface TransactionStats {
    total: number;
    total_in: number;
    total_out: number;
}