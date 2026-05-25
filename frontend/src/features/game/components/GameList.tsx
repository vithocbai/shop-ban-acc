import React, { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Star, Eye, EyeOff, Loader2 } from "lucide-react";
import { gameService } from "../services/game.service";
import type { Game } from "../types";
import GameModal from "./GameModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { toast } from "react-toastify";

const GameList: React.FC = () => {
    // Trạng thái lưu trữ danh sách Game
    const [games, setGames] = useState<Game[]>([]);
    // Trạng thái hiển thị khi đang tải dữ liệu (loading)
    const [loading, setLoading] = useState(true);
    // Trạng thái cho chuỗi tìm kiếm nhập trực tiếp từ ô Input
    const [searchTerm, setSearchTerm] = useState("");
    
    // Các trạng thái phân trang (Pagination State)
    const [page, setPage] = useState(1); // Trang hiện tại (mặc định trang 1)
    const [pageSize, setPageSize] = useState(10); // Số hàng trên mỗi trang (mặc định 10)
    const [total, setTotal] = useState(0); // Tổng số bản ghi khớp trên toàn hệ thống
    const [debouncedSearch, setDebouncedSearch] = useState(""); // Chuỗi tìm kiếm sau khi đã debounce

    // Trạng thái điều khiển Modal Thêm mới / Chỉnh sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // Debounce: Chờ người dùng dừng gõ 300ms rồi mới cập nhật debouncedSearch
    // Quy tắc reset trang: Reset page về 1 khi từ khóa tìm kiếm thay đổi
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Gọi lại API khi bất kỳ tham số nào (page, pageSize, debouncedSearch) thay đổi
    useEffect(() => {
        fetchGames();
    }, [page, pageSize, debouncedSearch]);

    // Hàm gọi API lấy danh sách game từ Backend
    const fetchGames = async () => {
        try {
            setLoading(true);
            const res = await gameService.getAllGames({
                page,
                page_size: pageSize,
                search: debouncedSearch
            });
            setGames(res.items);
            setTotal(res.total);
        } catch (err: any) {
            toast.error("Không thể tải danh sách game. Vui lòng thử lại sau.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Mở Modal để thêm mới game
    const handleAdd = () => {
        setSelectedGame(null);
        setIsModalOpen(true);
    };

    // Mở Modal để chỉnh sửa thông tin game đã chọn
    const handleEdit = (game: Game) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    // Gọi API xóa mềm game theo id
    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa game này? Tất cả các tài khoản thuộc game này có thể bị ảnh hưởng.")) return;
        
        try {
            setIsDeleting(id);
            await gameService.deleteGame(id);
            toast.success("Xóa game thành công!");
            // Sau khi xóa thành công, gọi lại API để load lại trang và cập nhật số lượng bản ghi chính xác
            fetchGames();
        } catch (err: any) {
            toast.error("Xóa game thất bại. Vui lòng thử lại.");
        } finally {
            setIsDeleting(null);
        }
    };

    // Đóng Modal thêm/sửa game
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedGame(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
                <p className="text-text-secondary font-medium">Đang tải danh sách game...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Header / Toolbar */}
            <div className="py-2 px-[1px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-0">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary z-10">
                        <Search size={18} />
                    </div>
                    <Input
                        type="text"
                        placeholder="Tìm kiếm game..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button 
                    onClick={handleAdd}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    Thêm Game mới
                </Button>
            </div>

            {/* Table */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                        <TableRow>
                            <TableHead>Game</TableHead>
                            <TableHead className="text-center">Thumbnail</TableHead>
                            <TableHead className="text-center">Banner</TableHead>
                            <TableHead className="text-center">Trạng thái</TableHead>
                            <TableHead className="text-center">Nổi bật</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {games.length > 0 ? (
                            games.map((game) => (
                                <TableRow key={game.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-md bg-bg-secondary flex items-center justify-center overflow-hidden border border-border-color">
                                                {game.icon ? (
                                                    <img src={game.icon} alt={game.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-text-secondary font-bold text-xl">
                                                        {game.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-main">{game.name}</p>
                                                <p className="text-xs text-text-secondary">{game.slug}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center">
                                            {game.thumbnail ? (
                                                <div className="w-16 h-9 rounded-md bg-bg-secondary flex items-center justify-center overflow-hidden border border-border-color">
                                                    <img src={game.thumbnail} alt={`${game.name} thumbnail`} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-text-secondary"></span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center">
                                            {game.banner ? (
                                                <div className="w-20 h-8 rounded-md bg-bg-secondary flex items-center justify-center overflow-hidden border border-border-color">
                                                    <img src={game.banner} alt={`${game.name} banner`} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-text-secondary"></span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {game.status === "ACTIVE" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20">
                                                <Eye size={14} />
                                                Hoạt động
                                            </span>
                                        ) : game.status === "HIDDEN" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-secondary text-text-secondary text-xs font-bold border border-border-color">
                                                <EyeOff size={14} />
                                                Đang ẩn
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold border border-warning/20">
                                                Bảo trì
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {game.is_hot ? (
                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning border border-warning/20">
                                                <Star size={16} fill="currentColor" />
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-secondary border-none text-text-secondary">
                                                <Star size={16} />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleEdit(game)}
                                                title="Chỉnh sửa"
                                                className="h-8 w-8 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer"
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleDelete(game.id)}
                                                disabled={isDeleting === game.id}
                                                title="Xóa"
                                                className="h-8 w-8 text-text-secondary hover:text-error hover:bg-error/10 cursor-pointer disabled:opacity-50"
                                            >
                                                {isDeleting === game.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="py-20 text-center text-text-secondary font-medium">
                                    Không tìm thấy game nào khớp với tìm kiếm.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Thanh Footer Phân Trang Sử Dụng Component Dùng Chung */}
                <PaginationControls
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    itemsLength={games.length}
                    onPageChange={(newPage) => setPage(newPage)}
                    onPageSizeChange={(newPageSize) => {
                        setPageSize(newPageSize);
                        setPage(1); // Reset về trang 1 khi đổi page size
                    }}
                    pageSizeOptions={[10, 20, 50]}
                />

                <GameModal 
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSuccess={fetchGames}
                    game={selectedGame}
                />
            </Card>
        </div>
    );
};

export default GameList;
