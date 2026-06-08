import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { paymentService, type Card as CardType } from "@/features/payment/services/payment.service";
import { toast } from "react-toastify";
import {
    Loader2,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    Lock,
    EllipsisVertical,
    LockKeyhole,
    CircleCheckBig,
    Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/shared/PaginationControls";
import CopyButton from "@/components/ui/copy-button";
import {
    DropdownMenuTrigger,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    ACTIVE: { label: "Hoạt động", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    USED: { label: "Đã dùng", color: "bg-gray-100 text-gray-800", icon: CheckCircle2 },
    LOCKED: { label: "Bị khóa", color: "bg-red-100 text-red-800", icon: Lock },
};

export default function CardManagement() {
    const [cards, setCards] = useState<CardType[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Pagination (mock implementation if api supports page/pageSize)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCards, setTotalCards] = useState(0);

    // Summary stats
    const [stats, setStats] = useState({ total: 0, active: 0, used: 0, locked: 0 });

    // Create Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createAmount, setCreateAmount] = useState<string>("50000");
    const [createQuantity, setCreateQuantity] = useState<string>("10");
    const [isCreating, setIsCreating] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // refreshKey tăng lên khi cần buộc tải lại data (tránh gọi API 2 lần do setPage + fetchCards)
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchCards = async () => {
        setLoading(true);
        try {
            const params: any = { page, page_size: pageSize };
            if (statusFilter !== "all") params.status = statusFilter;

            // Wait, does the API return paginated data?
            // In typical Django REST framework `PageNumberPagination`:
            // response.data = { count, next, previous, results }
            // Let's assume it returns `items` and `total` via our Envelope.
            const response = await paymentService.getCards(params);

            // If the envelope is not unwrapped properly, we handle it:
            let results = response.items || response.results || [];
            if (!response.items && Array.isArray(response)) results = response;

            setCards(results);

            if (response.total) {
                setTotalCards(response.total);
                setTotalPages(Math.ceil(response.total / pageSize));
            } else if (response.count) {
                setTotalCards(response.count);
                setTotalPages(Math.ceil(response.count / pageSize));
            } else {
                setTotalCards(results.length);
                setTotalPages(1);
            }

            // LƯU Ý: Frontend tạm thời không dùng list hiện tại để đếm vì bị sai khi phân trang
            // Hàm fetchStats ở dưới sẽ chịu trách nhiệm lấy số liệu tổng chính xác
        } catch (error) {
            console.error("Lỗi lấy danh sách thẻ", error);
            toast.error("Không thể lấy danh sách thẻ nạp");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Gọi /cards/stats/ thay vì fetch tất cả thẻ với page_size=999999
            // Tại sao? Backend chỉ chạy 1 DB query GROUP BY status → nhanh, không tốn băng thông
            const data = await paymentService.getCardStats();
            setStats(data);
        } catch (error) {
            console.error("Lỗi lấy số liệu thống kê", error);
        }
    };

    // Gọi fetchCards mỗi khi page, pageSize, filter, hoặc refreshKey thay đổi
    // refreshKey cho phép force reload mà không cần gọi fetchCards() thủ công 2 lần
    useEffect(() => {
        fetchCards();
    }, [page, pageSize, statusFilter, refreshKey]);

    useEffect(() => {
        // Chỉ cần gọi thống kê 1 lần khi load trang (hoặc khi cần thiết),
        // không bị phụ thuộc vào page hiện tại
        fetchStats();
    }, [refreshKey]);

    // Hàm xử lý tạo thẻ hàng loạt
    const handleCreateBatch = async () => {
        const qty = parseInt(createQuantity);
        const amt = parseInt(createAmount);

        if (qty < 1 || qty > 1000) {
            toast.error("Số lượng phải từ 1 đến 1000");
            return;
        }

        setIsCreating(true);
        try {
            const res = await paymentService.createCardsBatch(amt, qty);
            toast.success(res.message || `Đã tạo ${qty} thẻ thành công!`);
            setIsCreateOpen(false);
            // Dùng refreshKey thay vì gọi fetchCards() + setPage(1) riêng lẻ
            // Tại sao? Tránh 3 API call đồng thời: setPage(1)->useEffect + fetchCards() + fetchStats()
            setPage(1);
            setRefreshKey((k) => k + 1); // 1 key thay đổi → trigger 2 useEffect cùng lúc
        } catch (error: any) {
            toast.error(error.message || "Tạo thẻ thất bại");
        } finally {
            setIsCreating(false);
        }
    };

    // Toggle khóa/kích hoạt thẻ: ACTIVE ↔ LOCKED
    // Tại sao gộp 2 chiều vào 1 hàm? Tránh tồn tại 2 hàm riêng lẻ gây nhầm lẫn khi bảo trì
    const handleToggleStatus = async (card: CardType) => {
        if (card.status === "USED") {
            toast.error("Không thể thay đổi trạng thái thẻ đã sử dụng");
            return;
        }
        // LOCKED → kích hoạt ACTIVE, ACTIVE → khóa LOCKED
        const newStatus = card.status === "LOCKED" ? "ACTIVE" : "LOCKED";
        const actionLabel = newStatus === "ACTIVE" ? "kích hoạt" : "khóa";
        try {
            await paymentService.updateCardStatus(card.id, newStatus);
            toast.success(`Đã ${actionLabel} thẻ thành công`);
            setRefreshKey((k) => k + 1); // Trigger cả fetchCards lẫn fetchStats cùng lúc
        } catch (error: any) {
            toast.error(error.message || `Không thể ${actionLabel} thẻ`);
        }
    };

    // Mở modal confirm trước khi xóa thẻ
    const handleDeleteCardConfirm = (card: CardType) => {
        setSelectedCard(card);
        setIsDeleteModalOpen(true);
    };

    // Thực thi xóa thẻ sau khi đã confirm
    const executeDeleteCard = async () => {
        if (!selectedCard) return;
        try {
            await paymentService.deleteCard(selectedCard.id);
            toast.success("Đã xóa thẻ thành công");
            // Dùng refreshKey để đồng thời cập nhật cả danh sách và stats
            setRefreshKey((k) => k + 1);
        } catch (error: any) {
            toast.error(error.message || "Không thể xóa thẻ");
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý Thẻ nạp</h2>
                    <p className="text-muted-foreground">Tạo và quản lý danh sách thẻ cào/voucher.</p>
                </div>

                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                        <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                            <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                                <h3 className="text-lg font-bold text-text-main">Tạo thẻ nạp hàng loạt</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="p-6 flex-1 overflow-auto space-y-4">
                                <p className="text-sm text-text-secondary mb-4">
                                    Hệ thống sẽ sinh mã thẻ và serial ngẫu nhiên, sẵn sàng sử dụng.
                                </p>

                                <div className="space-y-2">
                                    <Label className="font-bold text-text-main">
                                        Mệnh giá <span className="text-error">*</span>
                                    </Label>
                                    <Select value={createAmount} onValueChange={setCreateAmount}>
                                        <SelectTrigger className="w-full bg-bg-secondary border-border-color">
                                            <SelectValue placeholder="Chọn mệnh giá" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10000">10,000 đ</SelectItem>
                                            <SelectItem value="20000">20,000 đ</SelectItem>
                                            <SelectItem value="50000">50,000 đ</SelectItem>
                                            <SelectItem value="100000">100,000 đ</SelectItem>
                                            <SelectItem value="200000">200,000 đ</SelectItem>
                                            <SelectItem value="500000">500,000 đ</SelectItem>
                                            <SelectItem value="1000000">1,000,000 đ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold text-text-main">
                                        Số lượng <span className="text-error">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        className="w-full bg-bg-secondary border-border-color"
                                        value={createQuantity}
                                        onChange={(e) => setCreateQuantity(e.target.value)}
                                        min="1"
                                        max="1000"
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                                <Button
                                    variant="outline"
                                    className="font-bold px-5"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button className="font-bold px-8" onClick={handleCreateBatch} disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Tiến hành tạo
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng thẻ</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Thẻ hoạt động</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Thẻ đã dùng</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats.used}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">Thẻ bị khóa</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats.locked}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Bar */}
            <div className="pb-2 px-[1px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-0">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary z-10">
                            <Search size={18} />
                        </div>
                        <Input placeholder="Tìm theo mã hoặc serial..." className="pl-10" />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Lọc trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                            <SelectItem value="USED">Đã dùng</SelectItem>
                            <SelectItem value="LOCKED">Bị khóa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Tạo thẻ hàng loạt
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                        <TableRow>
                            <TableHead className="w-[18%]">Mã thẻ</TableHead>
                            <TableHead className="w-[15%]">Số Serial</TableHead>
                            <TableHead className="w-[15%] text-right">Mệnh giá</TableHead>
                            <TableHead className="w-[18%] text-center">Trạng thái</TableHead>
                            <TableHead className="w-[15%] text-center">Ngày tạo</TableHead>
                            <TableHead className="w-[15%] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : cards.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Không có dữ liệu thẻ nạp.
                                </TableCell>
                            </TableRow>
                        ) : (
                            cards.map((card) => {
                                const statusConfig = STATUS_MAP[card.status] || STATUS_MAP.ACTIVE;
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <TableRow key={card.id}>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            <span>{card.code}</span>
                                            <CopyButton value={card.code} />
                                        </TableCell>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            <span>{card.serial}</span>
                                            <CopyButton value={card.serial} />
                                        </TableCell>
                                        <TableCell className="font-medium text-green-600 text-right whitespace-nowrap">
                                            {new Intl.NumberFormat("vi-VN").format(Number(card.amount))} đ
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                className={`${statusConfig.color} border-0 inline-flex items-center justify-center gap-1 text-sm`}
                                            >
                                                <StatusIcon className="h-3 w-3" />
                                                {statusConfig.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {new Date(card.created_at).toLocaleDateString("vi-VN")}
                                            <span className="ml-2">
                                                {new Date(card.created_at).toLocaleTimeString("vi-VN")}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {/* Hiển thị thao tác phù hợp với từng trạng thái thẻ */}
                                            <div className="flex items-center justify-end gap-1.5">
                                                {card.status === "ACTIVE" && (
                                                    <>
                                                        {/* Thẻ đang hoạt động: chỉ cho phép Khóa hoặc Xóa */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer px-2 text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-1"
                                                            onClick={() => handleToggleStatus(card)}
                                                        >
                                                            <LockKeyhole size={18} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer px-2 text-xs font-medium text-error hover:text-error hover:bg-error/10 gap-1"
                                                            onClick={() => handleDeleteCardConfirm(card)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </>
                                                )}
                                                {card.status === "LOCKED" && (
                                                    <>
                                                        {/* Thẻ bị khóa: chỉ cho phép Kích hoạt hoặc Xóa */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer px-2 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 gap-1"
                                                            onClick={() => handleToggleStatus(card)}
                                                        >
                                                            <CircleCheckBig size={18} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer px-2 text-xs font-medium text-error hover:text-error hover:bg-error/10 gap-1"
                                                            onClick={() => handleDeleteCardConfirm(card)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </>
                                                )}
                                                {card.status === "USED" && (
                                                    /* Thẻ đã dùng: không cho phép thao tác, chỉ hiển thị nhãn */
                                                    <span className="text-xs text-text-secondary italic px-2">
                                                        Không thể thao tác
                                                    </span>
                                                )}
                                            </div>
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
                    total={totalCards}
                    itemsLength={cards.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                    pageSizeOptions={[10, 20, 50, 100]}
                />

                {/* Model */}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={executeDeleteCard}
                    title="Xóa thẻ"
                    description={
                        <>
                            Bạn có chắc chắn muốn xóa thẻ{" "}
                            <span className="font-bold text-text-main">{selectedCard?.code}</span> không? Hành động này
                            sẽ xóa toàn bộ dữ liệu liên quan và không thể hoàn tác.
                        </>
                    }
                    confirmText="Xóa thẻ"
                    variant="danger"
                />
            </Card>
        </div>
    );
}
