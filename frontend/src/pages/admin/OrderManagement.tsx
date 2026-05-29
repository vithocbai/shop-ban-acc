import React from "react";
import { OrderList } from "../../features/order/components/OrderList";
import { FileText } from "lucide-react";

const OrderManagement: React.FC = () => {
    return (
        <div className="h-full flex flex-col min-h-0 space-y-2">
            <div className="flex items-center gap-3 shrink-0 pb-2 border-b border-border-color">
                <div>
                    <h1 className="text-2xl font-bold text-text-main leading-tight">Quản lý Đơn hàng</h1>
                    <p className="text-sm text-text-secondary mt-1">Theo dõi, kiểm tra và quản lý các đơn hàng mua tài khoản game.</p>
                </div>
            </div>

            <OrderList />
        </div>
    );
};

export default OrderManagement;
