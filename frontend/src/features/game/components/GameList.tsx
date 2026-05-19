import React, { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, MoreVertical, Star, Eye, EyeOff, Loader2 } from "lucide-react";
import { gameService } from "../services/game.service";
import type { Game } from "../types";
import GameModal from "./GameModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const GameList: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const data = await gameService.getAllGames();
            setGames(data);
            setError(null);
        } catch (err: any) {
            setError("Không thể tải danh sách game. Vui lòng thử lại sau.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedGame(null);
        setIsModalOpen(true);
    };

    const handleEdit = (game: Game) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa game này? Tất cả các tài khoản thuộc game này có thể bị ảnh hưởng.")) return;
        
        try {
            setIsDeleting(id);
            await gameService.deleteGame(id);
            setGames(prev => prev.filter(g => g.id !== id));
        } catch (err: any) {
            alert("Xóa game thất bại. Vui lòng thử lại.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedGame(null);
    };

    const filteredGames = games?.filter(game => 
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
                <p className="text-text-secondary font-medium">Đang tải danh sách game...</p>
            </div>
        );
    }

    return (
        <Card className="overflow-hidden">
            {/* Header / Toolbar */}
            <div className="p-5 border-b border-border-color flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
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

            {error && (
                <div className="m-5">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Table */}
            <Table className="bg-white">
                <TableHeader>
                    <TableRow>
                        <TableHead>Game</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="text-center">Thứ tự</TableHead>
                        <TableHead className="text-center">Nổi bật</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredGames.length > 0 ? (
                        filteredGames.map((game) => (
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
                                <TableCell className="text-center font-medium text-text-secondary">
                                    {game.sort_order}
                                </TableCell>
                                <TableCell className="text-center">
                                    {game.is_hot ? (
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning border border-warning/20">
                                            <Star size={16} fill="currentColor" />
                                        </div>
                                    ) : (
                                        <div className="text-border-color">
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
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer"
                                        >
                                            <MoreVertical size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="py-20 text-center text-text-secondary font-medium">
                                Không tìm thấy game nào khớp với tìm kiếm.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Footer / Pagination */}
            <div className="px-6 py-4 bg-bg-secondary/50 border-t border-border-color flex items-center justify-between">
                <p className="text-sm text-text-secondary font-medium">
                    Hiển thị <span className="text-text-main font-bold">{filteredGames.length}</span> / <span className="text-text-main font-bold">{games.length}</span> game
                </p>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled 
                        className="text-text-secondary/40 cursor-not-allowed bg-white"
                    >
                        Trước
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled 
                        className="text-text-secondary/40 cursor-not-allowed bg-white"
                    >
                        Sau
                    </Button>
                </div>
            </div>

            <GameModal 
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSuccess={fetchGames}
                game={selectedGame}
            />
        </Card>
    );
};

export default GameList;
