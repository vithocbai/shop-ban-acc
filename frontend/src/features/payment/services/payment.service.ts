import api from "@/services/api";
import type { ApiResponse } from "@/types";

export interface ManualDepositData {
    user_id: number;
    amount: number;
    payment_method: string;
    note?: string;
}

export const paymentService = {
    manualDeposit: async (data: ManualDepositData): Promise<any> => {
        const response = await api.post<ApiResponse<any>>("/manual-deposit/", data);
        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error(response.data?.message || "Nạp tiền thất bại");
    }
};
