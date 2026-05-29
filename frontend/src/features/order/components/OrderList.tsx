import React, { useEffect, useState } from "react";
import { orderService } from "../services/order.service";
import type { Order, OrderFilters } from "../types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { toast } from "react-toastify";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import OrderDetailDrawer from "./OrderDetailDrawer";
import { Badge } from "@/components/ui/badge";

const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Chờ thanh toán", color: "bg-warning text-white" },
    PAID: { label: "Đã thanh toán", color: "bg-success text-white" },
    FAILED: { label: "Thất bại", color: "bg-error text-white" },
    REFUNDED: { label: "Đã hoàn", color: "bg-gray-500 text-white" },
};

const DELIVERY_STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Chờ bàn giao", color: "bg-warning text-white" },
    DELIVERED: { label: "Đã bàn giao", color: "bg-success text-white" },
    FAILED: { label: "Lỗi", color: "bg-error text-white" },
};

export const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPayment, setFilterPayment] = useState<string>("");
    const [filterDelivery, setFilterDelivery] = useState<string>("");

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const filters: OrderFilters = {
                page,
                page_size: pageSize,
                search: searchTerm,
                payment_status: filterPayment,
                delivery_status: filterDelivery,
            };
            const res = await orderService.getOrders(filters);
            setOrders(res.items);
            setTotal(res.total);
        } catch (error) {
            toast.error("Không thể tải danh sách đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(debounce);
    }, [page, pageSize, searchTerm, filterPayment, filterDelivery]);

    const handleViewDetail = (order: Order) => {
        setSelectedOrder(order);
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setSelectedOrder(null);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Toolbar */}
            <div className="py-2 px-[1px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-0">
                <div className="flex flex-1 items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary z-10">
                            <Search size={18} />
                        </div>
                        <Input
                            type="text"
                            placeholder="Tìm mã đơn, email..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="pl-10"
                        />
                    </div>

                    {/* Filter Payment Status */}
                    <Select
                        value={filterPayment || "all"}
                        onValueChange={(val) => {
                            setFilterPayment(val === "all" ? "" : val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] bg-bg-secondary border-border-color">
                            <SelectValue placeholder="TT Thanh toán" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả thanh toán</SelectItem>
                            <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                            <SelectItem value="PAID">Đã thanh toán</SelectItem>
                            <SelectItem value="FAILED">Thất bại</SelectItem>
                            <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filter Delivery Status */}
                    <Select
                        value={filterDelivery || "all"}
                        onValueChange={(val) => {
                            setFilterDelivery(val === "all" ? "" : val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] bg-bg-secondary border-border-color">
                            <SelectValue placeholder="TT Bàn giao" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả bàn giao</SelectItem>
                            <SelectItem value="PENDING">Chờ bàn giao</SelectItem>
                            <SelectItem value="DELIVERED">Đã bàn giao</SelectItem>
                            <SelectItem value="FAILED">Lỗi bàn giao</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                        <TableRow>
                            <TableHead className="w-[15%]">Mã Đơn</TableHead>
                            <TableHead className="w-[20%]">Người Mua</TableHead>
                            <TableHead className="w-[15%] text-right">Tổng Tiền</TableHead>
                            <TableHead className="w-[15%] text-center">Thanh Toán</TableHead>
                            <TableHead className="w-[15%] text-center">Bàn Giao</TableHead>
                            <TableHead className="w-[10%] text-center">Thời Gian</TableHead>
                            <TableHead className="w-[10%] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
                                        <p className="text-text-secondary">Đang tải dữ liệu...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center text-text-secondary">
                                    Không tìm thấy đơn hàng nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const payConf = PAYMENT_STATUS_MAP[order.payment_status] || { label: order.payment_status, color: "bg-gray-200 text-black" };
                                const delConf = DELIVERY_STATUS_MAP[order.delivery_status] || { label: order.delivery_status, color: "bg-gray-200 text-black" };

                                return (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-bold text-text-main " onClick={() => handleViewDetail(order)}>
                                            #{order.order_code}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-sm text-text-main">{order.user?.username || "N/A"}</p>
                                            <p className="text-xs text-text-secondary">{order.user?.email || "N/A"}</p>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-error">
                                            {formatPrice(Number(order.total_price))}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={payConf.color}>{payConf.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={delConf.color}>{delConf.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-text-secondary">
                                            {new Date(order.created_at).toLocaleDateString("vi-VN")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="gap-1 h-8 px-2 border-border-color"
                                                onClick={() => handleViewDetail(order)}
                                            >
                                                <Eye size={14} />
                                                Chi tiết
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                <PaginationControls
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    itemsLength={orders.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    pageSizeOptions={[10, 20, 50]}
                />

                {isDrawerOpen && (
                    <OrderDetailDrawer
                        isOpen={isDrawerOpen}
                        onClose={handleDrawerClose}
                        order={selectedOrder}
                    />
                )}
            </Card>
        </div>
    );
};
