import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
    Loader2,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Wallet,
    Activity,
    Download,
} from "lucide-react";
import { PaginationControls } from "@/components/shared/PaginationControls";
import api from "@/services/api";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "success";

// Mapping trạng thái giao dịch nạp tiền sang label và màu sắc hiển thị
const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant; icon: any }> = {
    PENDING:  { label: "Đang chờ", variant: "default", icon: Clock },
    APPROVED: { label: "Thành công", variant: "success", icon: CheckCircle2 },
    REJECTED: { label: "Thất bại", variant: "destructive", icon: XCircle },
};

// Mapping phương thức nạp tiền sang label hiển thị thân thiện
const METHOD_MAP: Record<string, string> = {
    MANUAL:      "Thủ công",
    CARD:        "Thẻ cào",
    BANK_TRANSFER:  "Chuyển khoản",
    MOMO:        "MoMo",
    ZALOPAY:     "ZaloPay",
};

interface Deposit {
    id: number;
    user: { id: number; username: string; email: string } | null;
    amount: number;
    fee: number;
    net_amount: number;
    method: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    admin_note?: string;
    note?: string;
    created_at: string;
    approved_at?: string;
    approved_by?: { id: number; username: string } | null;
}

interface DepositStats {
    total: number;
    total_amount: number;
    approved: number;
    pending: number;
    rejected: number;
}

export default function DepositHistory() {
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [loading, setLoading] = useState(false);

    // Bộ lọc
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [methodFilter, setMethodFilter] = useState<string>("all");
    const [search, setSearch] = useState<string>("");

    // Phân trang
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);

    // Stats summary riêng — lấy toàn bộ, không bị ảnh hưởng bởi phân trang
    const [stats, setStats] = useState<DepositStats>({
        total: 0, total_amount: 0, approved: 0, pending: 0, rejected: 0,
    });
    console.log("🚀 ~ file: DepositHistory.tsx:122 ~ DepositHistory ~ stats:", stats);

    // refreshKey để trigger cả 2 useEffect (list + stats) sau mỗi action
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, page_size: pageSize };
            if (statusFilter !== "all") params.status = statusFilter;
            if (methodFilter !== "all") params.method = methodFilter;
            if (search.trim()) params.search = search.trim();

            const response = await api.get("/deposits/", { params });
            const data = response.data?.data ?? response.data;

            // Xử lý cả 2 format: DRF pagination (count/results) và Envelope (total/items)
            const results = data?.results || data?.items || [];
            setDeposits(results);
            setTotal(data?.count ?? data?.total ?? results.length);
        } catch (error) {
            console.error("Lỗi tải lịch sử nạp tiền", error);
            toast.error("Không thể tải lịch sử nạp tiền");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Lấy toàn bộ deposits không phân trang để tính tổng chính xác
            // Tại sao? Tương tự cards/stats — không thể đếm từ danh sách đã phân trang
            const response = await api.get("/deposits/", { params: { page_size: 999999 } });
            const data = response.data?.data ?? response.data;
            const all: Deposit[] = data?.results || data?.items || [];

            const approved = all.filter(d => d.status === "APPROVED").length;
            const pending  = all.filter(d => d.status === "PENDING").length;
            const rejected = all.filter(d => d.status === "REJECTED").length;
            const total_amount = all
                .filter(d => d.status === "APPROVED")
                // Tại sao dùng Number()? Backend trả amount là string "200000.00" (DecimalField),
                // nếu không parse thì JS sẽ nối chuỗi thay vì cộng số → ra kết quả sai
                .reduce((sum, d) => sum + Number(d.amount), 0);

            setStats({ total: all.length, total_amount, approved, pending, rejected });
        } catch (error) {
            console.error("Lỗi tải thống kê nạp tiền", error);
        }
    };

    // Gọi lại cả list lẫn stats mỗi khi bộ lọc, trang, hoặc refreshKey thay đổi
    useEffect(() => {
        fetchDeposits();
    }, [page, pageSize, statusFilter, methodFilter, search, refreshKey]);

    useEffect(() => {
        fetchStats();
    }, [refreshKey]);

    const handleExport = () => {
        // TODO: Tích hợp export Excel/CSV khi backend có sẵn endpoint
        toast.info("Tính năng xuất dữ liệu đang được phát triển");
    };

    // Luôn ép về Number() trước khi format — tại sao? Django DecimalField serialize ra string "200000.00"
    const formatCurrency = (amount: number | string) =>
        new Intl.NumberFormat("vi-VN").format(Number(amount)) + " đ";

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN")}`;
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-2">

            {/* Summary Stats — 4 thẻ tóm tắt */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Tổng giao dịch
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.pending} đang chờ xử lý
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Tổng tiền nạp thành công
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_amount)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.approved} giao dịch
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Đang chờ duyệt
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% tổng số
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Thất bại / Từ chối
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% tổng số
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Thanh công cụ tìm kiếm và lọc — đồng nhất với CardManagement */}
            <div className="pb-2 px-[1px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-0">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary z-10">
                            <Search size={18} />
                        </div>
                        <Input
                            placeholder="Tìm theo người dùng hoặc email..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="PENDING">Đang chờ</SelectItem>
                            <SelectItem value="APPROVED">Thành công</SelectItem>
                            <SelectItem value="REJECTED">Thất bại</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Phương thức" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả phương thức</SelectItem>
                            <SelectItem value="MANUAL">Thủ công</SelectItem>
                            <SelectItem value="CARD">Thẻ cào</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                            <SelectItem value="MOMO">MoMo</SelectItem>
                            <SelectItem value="ZALOPAY">ZaloPay</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Xuất dữ liệu
                    </Button>
                </div>
            </div>

            {/* Bảng danh sách — đồng nhất className với CardManagement */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                        <TableRow>
                            <TableHead className="w-[12%]">Người dùng</TableHead>
                            <TableHead className="w-[12%] text-center">Phương thức</TableHead>
                            <TableHead className="w-[11%] text-right">Số tiền</TableHead>
                            <TableHead className="w-[9%] text-right">Phí GD</TableHead>
                            <TableHead className="w-[11%] text-right">Thực nhận</TableHead>
                            <TableHead className="w-[9%] text-center">Trạng thái</TableHead>
                            <TableHead className="w-[16%] text-center">Thời gian</TableHead>
                            <TableHead className="w-[18%]">Người duyệt / Ghi chú</TableHead>
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
                        ) : deposits.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-text-secondary">
                                    Không tìm thấy giao dịch nào khớp với bộ lọc.
                                </TableCell>
                            </TableRow>
                        ) : (
                            deposits.map((deposit) => {
                                const statusConf = STATUS_MAP[deposit.status] || STATUS_MAP.PENDING;
                                return (
                                    <TableRow key={deposit.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-bold text-sm text-text-main">{deposit.user?.username ?? ""}</p>
                                                <p className="text-xs text-text-secondary">{deposit.user?.email ?? ""}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-sm">
                                                {METHOD_MAP[deposit.method] ?? deposit.method}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium success whitespace-nowrap">
                                            {formatCurrency(deposit.amount)}
                                        </TableCell>
                                        {/* Phí giao dịch — hiện = 0, sẵn sàng hiển thị khi backend có phí */}
                                        <TableCell className="text-right text-sm whitespace-nowrap">
                                            {deposit.fee > 0 ? formatCurrency(deposit.fee) : <span className="">Miễn phí</span>}
                                        </TableCell>
                                        {/* Thực nhận = amount - fee, backend tính sẵn */}
                                        <TableCell className="text-right font-bold text-blue-600 whitespace-nowrap">
                                            {formatCurrency(deposit.net_amount)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={statusConf.variant}
                                                className={`${statusConf.variant} border-0 inline-flex items-center gap-1 text-sm`}
                                            >
                                                {statusConf.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-sm whitespace-nowrap">
                                            {formatDate(deposit.created_at)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {deposit.admin_note && (
                                                <p className="text-sm" title={deposit.admin_note}>
                                                    {deposit.admin_note}
                                                </p>
                                            )}
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
                    itemsLength={deposits.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    pageSizeOptions={[10, 20, 50, 100]}
                />
            </Card>
        </div>
    );
}
