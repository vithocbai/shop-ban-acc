import React, { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, MoreVertical, Star, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { gameService } from "../services/game.service";
import type { Game } from "../types";
import GameModal from "./GameModal";

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
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-500 font-medium">Đang tải danh sách game...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header / Toolbar */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm game..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-primary/20"
                >
                    <Plus size={18} />
                    Thêm Game mới
                </button>
            </div>

            {error && (
                <div className="m-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Game</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Thứ tự</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Nổi bật</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredGames.length > 0 ? (
                            filteredGames.map((game) => (
                                <tr key={game.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                {game.icon ? (
                                                    <img src={game.icon} alt={game.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-slate-400 font-bold text-xl">
                                                        {game.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{game.name}</p>
                                                <p className="text-xs text-slate-500">{game.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {game.status === "ACTIVE" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                                                <Eye size={14} />
                                                Hoạt động
                                            </span>
                                        ) : game.status === "HIDDEN" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                                                <EyeOff size={14} />
                                                Đang ẩn
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                                                Bảo trì
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-slate-600">
                                        {game.sort_order}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {game.is_hot ? (
                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-500 border border-amber-100">
                                                <Star size={16} fill="currentColor" />
                                            </div>
                                        ) : (
                                            <div className="text-slate-200">
                                                <Star size={16} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(game)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" 
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(game.id)}
                                                disabled={isDeleting === game.id}
                                                className="p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-lg transition-all disabled:opacity-50" 
                                                title="Xóa"
                                            >
                                                {isDeleting === game.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-medium">
                                    Không tìm thấy game nào khớp với tìm kiếm.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium">
                    Hiển thị <span className="text-slate-800 font-bold">{filteredGames.length}</span> / <span className="text-slate-800 font-bold">{games.length}</span> game
                </p>
                <div className="flex gap-2">
                    <button disabled className="px-4 py-2 text-sm font-bold text-slate-400 bg-white border border-slate-200 rounded-xl cursor-not-allowed">Trước</button>
                    <button disabled className="px-4 py-2 text-sm font-bold text-slate-400 bg-white border border-slate-200 rounded-xl cursor-not-allowed">Sau</button>
                </div>
            </div>

            <GameModal 
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSuccess={fetchGames}
                game={selectedGame}
            />
        </div>
    );
};

export default GameList;
