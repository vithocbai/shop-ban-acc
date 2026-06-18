import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-toastify";
import {
    Loader2,
    Search,
    History,
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    Activity,
} from "lucide-react";
import { PaginationControls } from "@/components/shared/PaginationControls";
import api from "@/services/api";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Transaction, TransactionStats } from "@/features/transaction/types";

// Map transaction type
const TYPE_MAP: Record<string, { label: string; color: string; icon: any; isPositive: boolean }> = {
    DEPOSIT: { label: "Nạp tiền", color: "text-green-600", icon: ArrowDownRight, isPositive: true },
    WITHDRAW: { label: "Rút tiền", color: "text-rose-600", icon: ArrowUpRight, isPositive: false },
    PURCHASE: { label: "Mua hàng", color: "text-amber-600", icon: Banknote, isPositive: false },
    REFUND: { label: "Hoàn tiền", color: "text-blue-600", icon: ArrowDownRight, isPositive: true },
    MANUAL_ADD: { label: "Cộng thủ công", color: "text-purple-600", icon: ArrowDownRight, isPositive: true }
};

export default function TransactionManagement() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [search, setSearch] = useState<string>("");

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);

    // Stats
    const [stats, setStats] = useState<TransactionStats>({
        total: 0,
        total_in: 0,
        total_out: 0,
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, page_size: pageSize };
            if (typeFilter !== "all") params.type = typeFilter;
            if (search.trim()) params.search = search.trim();

            const [listRes, statsRes] = await Promise.all([
                api.
            ])
            const response = await api.get("/transactions/", { params });
            const data = response.data?.data ?? response.data;

            const results = data?.results || data?.items || [];
            setTransactions(results);
            setTotal(data?.count ?? data?.total ?? results.length);
        } catch (error) {
            console.error("Lỗi tải lịch sử giao dịch", error);
            toast.error("Không thể tải lịch sử giao dịch");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get("/transactions/", { params: { page_size: 999999 } });
            const data = response.data?.data ?? response.data;
            const all: Transaction[] = data?.results || data?.items || [];

            let total_in = 0;
            let total_out = 0;

            all.forEach(t => {
                const conf = TYPE_MAP[t.type];
                if (conf?.isPositive) {
                    total_in += Number(t.amount);
                } else {
                    total_out += Number(t.amount);
                }
            });

            setStats({ total: all.length, total_in, total_out });
        } catch (error) {
            console.error("Lỗi tải thống kê giao dịch", error);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, pageSize, typeFilter, search,]);

    useEffect(() => {
        fetchStats();
    }, []);

    const formatCurrency = (amount: number | string, isPositive: boolean) => {
        const prefix = isPositive ? "+" : "-";
        const color = isPositive ? "text-success" : "text-error";
        return <span className={`font-bold ${color}`}>{prefix}{formatPrice(Number(amount))}</span>;
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Tổng số giao dịch
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tất cả biến động số dư
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-success flex items-center gap-2">
                            <ArrowDownRight className="h-4 w-4" />
                            Tổng tiền vào
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-success">+{formatPrice(stats.total_in)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Nạp tiền, hoàn tiền
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-error flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4" />
                            Tổng tiền ra
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-error">-{formatPrice(stats.total_out)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Mua hàng, rút tiền
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="pb-2 px-[1px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-0">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary z-10">
                            <Search size={18} />
                        </div>
                        <Input
                            placeholder="Tìm theo người dùng, email hoặc mã..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Tất cả loại giao dịch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="DEPOSIT">Nạp tiền</SelectItem>
                            <SelectItem value="PURCHASE">Mua hàng</SelectItem>
                            <SelectItem value="REFUND">Hoàn tiền</SelectItem>
                            <SelectItem value="WITHDRAW">Rút tiền</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white min-w-[1100px] table-fixed" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                        <TableRow>
                            <TableHead className="w-[12%]">Mã giao dịch</TableHead>
                            <TableHead className="w-[12%]">Khách hàng</TableHead> 
                            <TableHead className="w-[10%] text-center">Loại</TableHead>
                            <TableHead className="w-[12%] text-right">Biến động</TableHead>
                            <TableHead className="w-[12%] text-right">Số dư cuối</TableHead>
                            <TableHead className="w-[15%] text-center">Thời gian</TableHead>
                            <TableHead className="w-[25%]">Nội dung (Ghi chú)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                    <p className="text-sm text-text-secondary mt-2">Đang tải dữ liệu...</p>
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-text-secondary">
                                    Không tìm thấy giao dịch nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((t) => {
                                const typeConf = TYPE_MAP[t.type] || { label: t.type, color: "text-gray-600", icon: History, isPositive: true };
                                
                                return (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <span className="font-medium text-main">#{t.transaction_code}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm text-text-main">{t.user?.username || "Hệ thống"}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm min-w-[80px] font-semibold whitespace-nowrap ${typeConf.color}`}>
                                                {typeConf.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            {formatCurrency(t.amount, typeConf.isPositive)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-text-main whitespace-nowrap">
                                            {formatPrice(Number(t.balance_after))} 
                                        </TableCell>

                                        <TableCell className="text-center text-sm whitespace-nowrap text-text-main font-medium">
                                            {(() => {
                                                const fullDate = formatDate(t.created_at);
                                                if (fullDate === "—") return fullDate;
                                                const [datePart, timePart] = fullDate.split(" ");
                                                return (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span>{datePart}</span>
                                                        <span className="text-sm text-text-secondary mt-0.5">{timePart}</span>
                                                    </div>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-text-main font-medium line-clamp-2" title={t.note}>
                                                {t.note}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <PaginationControls
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    itemsLength={transactions.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    pageSizeOptions={[10, 20, 50, 100]}
                />
            </Card>
        </div>
    );
}
