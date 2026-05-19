import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { Game, GameCreateInput } from "../types";
import { gameService } from "../services/game.service";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface GameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    game?: Game | null; // If present, it's Edit mode
}

// Hàm chuyển đổi chuỗi tiếng Việt thành Slug chuẩn
const convertToSlug = (text: string): string => {
    return text
        .toLowerCase()
        .normalize("NFD") // Tách các dấu khỏi chữ cái gốc
        .replace(/[\u0300-\u036f]/g, "") // Xóa toàn bộ dấu tiếng Việt
        .replace(/đ/g, "d")
        .replace(/([^0-9a-z-\s])/g, "") // Xóa ký tự đặc biệt
        .replace(/(\s+)/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
        .replace(/-+/g, "-") // Thu gọn nhiều dấu gạch ngang liên tiếp thành 1
        .replace(/^-+|-+$/g, ""); // Cắt bỏ dấu gạch ngang ở đầu hoặc cuối chuỗi
};

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
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => {
            const nextState = {
                ...prev,
                [name]: type === "checkbox" ? checked : value
            };

            // Nếu người dùng đang gõ trường "name", tự động cập nhật "slug" tương ứng
            if (name === "name") {
                nextState.slug = convertToSlug(value);
            }

            return nextState;
        });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-main">
                        {game ? "Chỉnh sửa Game" : "Thêm Game mới"}
                    </h3>
                    <Button
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose} 
                        className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer"
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Tên Game <span className="text-error">*</span></Label>
                            <Input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: Liên Quân Mobile"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Slug (Đường dẫn) <span className="text-error">*</span></Label>
                            <Input
                                required
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: lien-quan-mobile"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="font-bold text-text-main">Mô tả</Label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-text-main placeholder:text-text-secondary"
                            placeholder="Mô tả ngắn về game..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Trạng thái</Label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="HIDDEN">Ẩn</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Thứ tự hiển thị</Label>
                            <Input
                                type="number"
                                name="sort_order"
                                value={formData.sort_order}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Màu chủ đạo</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    name="theme_color"
                                    value={formData.theme_color}
                                    onChange={handleInputChange}
                                    className="h-10 w-12 p-1 bg-white border border-border-color rounded-md cursor-pointer animate-none"
                                />
                                <Input
                                    type="text"
                                    name="theme_color"
                                    value={formData.theme_color}
                                    onChange={handleInputChange}
                                    className="flex-1"
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
                                className="w-4 h-4 text-primary rounded border-border-color focus:ring-primary/20 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-text-main select-none">Đánh dấu là Game HOT</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Icon URL</Label>
                            <Input
                                name="icon"
                                value={formData.icon}
                                onChange={handleInputChange}
                                placeholder="https://example.com/icon.png"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Thumbnail URL</Label>
                            <Input
                                name="thumbnail"
                                value={formData.thumbnail}
                                onChange={handleInputChange}
                                placeholder="https://example.com/thumb.png"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="font-bold px-5"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="font-bold px-8"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <Save size={18} />
                                {game ? "Lưu thay đổi" : "Tạo Game"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GameModal;
