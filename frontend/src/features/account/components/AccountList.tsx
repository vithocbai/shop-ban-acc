import React, { useEffect, useState } from "react";
import {
    Plus, Search, Edit2, Trash2, Star, Eye, EyeOff,
    Loader2, Filter, ShieldCheck, Lock, ShoppingBag, EyeIcon
} from "lucide-react";
import { accountService } from "../services/account.service";
import { gameService } from "../../game/services/game.service";
import type { Account, AccountStatus } from "../types";
import type { Game } from "../../game/types";
import AccountModal from "./AccountModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

// Cấu hình badge cho từng trạng thái tài khoản
export const STATUS_CONFIG: Record<AccountStatus, { label: string; className: string; icon?: React.ReactNode }> = {
    AVAILABLE: {
        label: "Đang bán",
        className: "bg-success/10 text-success border-success/20",
        icon: <ShoppingBag size={14} />,
    },
    RESERVED: {
        label: "Đang giữ",
        className: "bg-warning/10 text-warning border-warning/20",
        icon: <ShieldCheck size={14} />,
    },
    SOLD: {
        label: "Đã bán",
        className: "bg-bg-secondary text-text-secondary border-border-color",
        icon: <ShoppingBag size={14} />,
    },
    LOCKED: {
        label: "Đã khóa",
        className: "bg-error/10 text-error border-error/20",
        icon: <Lock size={14} />,
    },
    HIDDEN: {
        label: "Tạm ẩn",
        className: "bg-purple-50 text-purple-600 border-purple-200",
        icon: <EyeOff size={14} />,
    },
};

const AccountList: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Phân trang
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // Bộ lọc
    const [filterGame, setFilterGame] = useState<number | "">("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [gameList, setGameList] = useState<Game[]>([]);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // Load danh sách game cho dropdown filter
    useEffect(() => {
        const loadGames = async () => {
            try {
                const res = await gameService.getAllGames({ no_pagination: true });
                console.log("Danh sách game tải về:", res);
                setGameList(res.items || []);
            } catch {
                console.error("Không thể tải danh sách game cho bộ lọc.");
            }
        };
        loadGames();
    }, []);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch accounts khi params thay đổi
    useEffect(() => {
        fetchAccounts();
    }, [page, pageSize, debouncedSearch, filterGame, filterStatus]);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                page_size: pageSize,
                search: debouncedSearch || undefined,
            };
            if (filterGame) params.game = filterGame;
            if (filterStatus) params.status = filterStatus;

            const res = await accountService.getAllAccounts(params);
            setAccounts(res.items);
            setTotal(res.total);
        } catch (err: any) {
            toast.error("Không thể tải danh sách tài khoản. Vui lòng thử lại sau.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedAccount(null);
        setIsModalOpen(true);
    };

    const handleEdit = (account: Account) => {
        setSelectedAccount(account);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
        try {
            setIsDeleting(id);
            await accountService.deleteAccount(id);
            toast.success("Xóa tài khoản thành công!");
            fetchAccounts();
        } catch (err: any) {
            toast.error("Xóa tài khoản thất bại. Vui lòng thử lại.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedAccount(null);
    };

    // Format tiền VND
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    if (loading && accounts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
                <p className="text-text-secondary font-medium">Đang tải danh sách tài khoản...</p>
            </div>
        );
    }

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
                            placeholder="Tìm theo tên, mã tài khoản..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filter Game */}
                    <Select
                        value={filterGame ? String(filterGame) : "all"}
                        onValueChange={(val) => {
                            setFilterGame(val === "all" ? "" : Number(val));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] bg-bg-secondary border-border-color">
                            <SelectValue placeholder="Tất cả Game" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả Game</SelectItem>
                            {gameList.map((g) => (
                                <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter Status */}
                    <Select
                        value={filterStatus || "all"}
                        onValueChange={(val) => {
                            setFilterStatus(val === "all" ? "" : val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] bg-bg-secondary border-border-color">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="AVAILABLE">Đang bán</SelectItem>
                            <SelectItem value="RESERVED">Đang giữ</SelectItem>
                            <SelectItem value="SOLD">Đã bán</SelectItem>
                            <SelectItem value="LOCKED">Đã khóa</SelectItem>
                            <SelectItem value="HIDDEN">Tạm ẩn</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={handleAdd} className="flex items-center gap-2">
                    <Plus size={18} />
                    Thêm tài khoản
                </Button>
            </div>

            {/* Table */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                        <TableRow>
                            <TableHead className="w-[22%]">Tài khoản</TableHead>
                            <TableHead className="w-[18%]">Game</TableHead>
                            <TableHead className="w-[18%] text-right">Giá</TableHead>
                            <TableHead className="w-[12%] text-center">Trạng thái</TableHead>
                            <TableHead className="w-[8%] text-center">Hot</TableHead>
                            <TableHead className="w-[12%] text-center">Lượt xem</TableHead>
                            <TableHead className="w-[12%] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.length > 0 ? (
                            accounts.map((account, index) => {
                                const statusConfig = STATUS_CONFIG[account.status];
                                return (
                                    <TableRow key={account.id}>
                                        {/* Tài khoản: Thumbnail + Title + Code */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-md bg-bg-secondary flex items-center justify-center overflow-hidden border border-border-color shrink-0">
                                                    {account.thumbnail ? (
                                                        <img src={account.thumbnail} alt={account.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-text-secondary font-bold text-sm">
                                                            {account.title.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-text-main truncate text-sm" title={account.title}>
                                                        {account.title}
                                                    </p>
                                                    <p className="text-xs text-text-secondary truncate" title={account.account_code}>
                                                        #{account.account_code}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Game */}
                                        <TableCell>
                                            <span className="text-sm text-text-main font-medium">{account.game_name}</span>
                                        </TableCell>

                                        {/* Giá */}
                                        <TableCell className="text-right">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-text-main text-sm">{formatPrice(account.price)}</p>
                                                {account.original_price && account.original_price > account.price && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-xs text-text-secondary line-through">
                                                            {formatPrice(account.original_price)}
                                                        </span>
                                                        {account.discount_percent > 0 && (
                                                            <span className="text-xs font-bold text-error bg-error/10 px-1.5 py-0.5 rounded">
                                                                -{account.discount_percent}%
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Trạng thái */}
                                        <TableCell className="text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.className}`}>
                                                {statusConfig.icon}
                                                {statusConfig.label}
                                            </span>
                                        </TableCell>

                                        {/* Hot */}
                                        <TableCell className="text-center">
                                            {account.is_hot ? (
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning border border-warning/20">
                                                    <Star size={16} fill="currentColor" />
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-secondary border-none text-text-secondary">
                                                    <Star size={16} />
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Lượt xem */}
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                                                <EyeIcon size={14} />
                                                {account.views}
                                            </span>
                                        </TableCell>

                                        {/* Thao tác */}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(account)}
                                                    title="Chỉnh sửa"
                                                    className="h-8 w-8 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(account.id)}
                                                    disabled={isDeleting === account.id}
                                                    title="Xóa"
                                                    className="h-8 w-8 text-text-secondary hover:text-error hover:bg-error/10 cursor-pointer disabled:opacity-50"
                                                >
                                                    {isDeleting === account.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="py-20 text-center text-text-secondary font-medium">
                                    {debouncedSearch || filterGame || filterStatus
                                        ? "Không tìm thấy tài khoản nào khớp với bộ lọc."
                                        : "Chưa có tài khoản nào. Nhấn \"Thêm tài khoản\" để bắt đầu."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <PaginationControls
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    itemsLength={accounts.length}
                    onPageChange={(newPage) => setPage(newPage)}
                    onPageSizeChange={(newPageSize) => {
                        setPageSize(newPageSize);
                        setPage(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                />

                {isModalOpen && (
                    <AccountModal
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        onSuccess={fetchAccounts}
                        account={selectedAccount}
                        gameList={gameList}
                    />
                )}
            </Card>
        </div>
    );
};

export default AccountList;
