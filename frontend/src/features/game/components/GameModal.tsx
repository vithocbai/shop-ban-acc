import React, { useState, useEffect } from "react";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import type { Game, GameCreateInput } from "../types";
import { gameService } from "../services/game.service";

interface GameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    game?: Game | null; // If present, it's Edit mode
}

const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose, onSuccess, game }) => {
    const [formData, setFormData] = useState<GameCreateInput>({
        name: "",
        slug: "",
        description: "",
        status: "ACTIVE",
        sort_order: 0,
        is_hot: false,
        theme_color: "#008BFF",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (game) {
            setFormData({
                name: game.name,
                slug: game.slug,
                description: game.description || "",
                status: game.status,
                sort_order: game.sort_order,
                is_hot: game.is_hot,
                theme_color: game.theme_color || "#008BFF",
                icon: game.icon,
                banner: game.banner,
                thumbnail: game.thumbnail,
            });
        } else {
            setFormData({
                name: "",
                slug: "",
                description: "",
                status: "ACTIVE",
                sort_order: 0,
                is_hot: false,
                theme_color: "#008BFF",
            });
        }
    }, [game, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (game) {
                await gameService.updateGame(game.id, formData);
            } else {
                await gameService.createGame(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">
                        {game ? "Chỉnh sửa Game" : "Thêm Game mới"}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Tên Game <span className="text-error">*</span></label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Ví dụ: Liên Quân Mobile"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Slug (Đường dẫn) <span className="text-error">*</span></label>
                            <input
                                required
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Ví dụ: lien-quan-mobile"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            placeholder="Mô tả ngắn về game..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Trạng thái</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="HIDDEN">Ẩn</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Thứ tự hiển thị</label>
                            <input
                                type="number"
                                name="sort_order"
                                value={formData.sort_order}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Màu chủ đạo</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    name="theme_color"
                                    value={formData.theme_color}
                                    onChange={handleInputChange}
                                    className="h-10 w-12 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                                />
                                <input
                                    type="text"
                                    name="theme_color"
                                    value={formData.theme_color}
                                    onChange={handleInputChange}
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_hot"
                                checked={formData.is_hot}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20"
                            />
                            <span className="text-sm font-bold text-slate-700">Đánh dấu là Game HOT</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Icon URL</label>
                            <input
                                name="icon"
                                value={formData.icon}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="https://example.com/icon.png"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Thumbnail URL</label>
                            <input
                                name="thumbnail"
                                value={formData.thumbnail}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="https://example.com/thumb.png"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <Save size={18} />
                                {game ? "Lưu thay đổi" : "Tạo Game"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameModal;
