import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { Order } from "../types";
import { formatPrice } from "@/lib/utils";

interface OrderDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Chờ thanh toán", color: "bg-warning text-white" },
    PAID: { label: "Đã thanh toán", color: "bg-success text-white" },
    FAILED: { label: "Thất bại", color: "bg-error text-white" },
    REFUNDED: { label: "Đã hoàn tiền", color: "bg-gray-500 text-white" },
};

const DELIVERY_STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Chờ bàn giao", color: "bg-warning text-white" },
    DELIVERED: { label: "Đã bàn giao", color: "bg-success text-white" },
    FAILED: { label: "Lỗi bàn giao", color: "bg-error text-white" },
};

const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ isOpen, onClose, order }) => {
    if (!order) return null;

    const paymentConfig = PAYMENT_STATUS_MAP[order.payment_status] || { label: order.payment_status, color: "bg-gray-200 text-black" };
    const deliveryConfig = DELIVERY_STATUS_MAP[order.delivery_status] || { label: order.delivery_status, color: "bg-gray-200 text-black" };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-4 border-none">
                <SheetHeader className="border-b px-0 py-4">
                    <SheetTitle className="text-xl font-bold flex flex-col gap-2">
                        <span>Chi tiết Đơn hàng #{order.order_code}</span>
                        <div className="flex gap-2">
                            <Badge className={paymentConfig.color}>{paymentConfig.label}</Badge>
                            <Badge className={deliveryConfig.color}>{deliveryConfig.label}</Badge>
                        </div>
                    </SheetTitle>
                    <p className="text-sm text-text-secondary mt-2">
                        Thời gian tạo: {new Date(order.created_at).toLocaleString("vi-VN")}
                    </p>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Thông tin người mua */}
                    <section>
                        <h3 className="text-base font-bold text-text-main mb-3">Thông tin Khách hàng</h3>
                        <div className="bg-bg-secondary p-4 rounded-md border border-border-color space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Tên đăng nhập:</span>
                                <span className="font-bold text-text-main">{order.user?.username || "Không có"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Email:</span>
                                <span className="font-medium text-text-main">{order.user?.email || "Không có"}</span>
                            </div>
                        </div>
                    </section>

                    {/* Chi tiết Item (Tài khoản) */}
                    <section>
                        <h3 className="text-base font-bold text-text-main mb-3">Danh sách Tài khoản ({order.items.length})</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="border border-border-color rounded-md overflow-hidden bg-white">
                                    <div className="p-4 bg-bg-secondary/50 border-b border-border-color flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-text-main">{item.account?.title || "Tài khoản đã xóa"}</p>
                                            <p className="text-xs text-text-secondary">Mã tài khoản: #{item.account?.account_code || "Không có"}</p>
                                        </div>
                                        <p className="font-bold text-error">{formatPrice(Number(item.price))}</p>
                                    </div>
                                    
                                    {/* Thông tin bàn giao (Username/Pass của Game) */}
                                    {item.delivery_data && Object.keys(item.delivery_data).length > 0 && (
                                        <div className="p-4">
                                            <p className="text-xs font-bold uppercase text-text-secondary mb-2">Thông tin Bàn giao:</p>
                                            <div className="bg-orange-50 border border-orange-200 p-3 rounded-md space-y-2 text-sm">
                                                {Object.entries(item.delivery_data).map(([k, v]) => {
                                                    const keyMap: Record<string, string> = {
                                                        username_game: "Tài khoản Game",
                                                        password_game: "Mật khẩu Game",
                                                        email_game: "Email Game",
                                                        note: "Ghi chú"
                                                    };
                                                    // Chuyển key về viết thường để map chính xác
                                                    const displayKey = keyMap[k.toLowerCase()] || k;
                                                    
                                                    return (
                                                        <div key={k} className="flex gap-2">
                                                            <span className="font-medium text-orange-800 w-32 shrink-0">{displayKey}:</span>
                                                            <span className="font-bold text-orange-900 break-all">{String(v)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tổng kết */}
                    <section className="border-t border-border-color pt-4 flex justify-between items-center">
                        <span className="font-medium text-text-secondary uppercase">Tổng thanh toán:</span>
                        <span className="text-2xl font-medium text-error">{formatPrice(Number(order.total_price))}</span>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default OrderDetailDrawer;
