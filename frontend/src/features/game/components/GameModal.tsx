import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { Game, GameCreateInput } from "../types";
import { gameService } from "../services/game.service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

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
        icon: "",
        banner: "",
        thumbnail: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setFieldErrors({});
        if (game) {
            setFormData({
                name: game.name,
                slug: game.slug,
                description: game.description || "",
                status: game.status,
                sort_order: game.sort_order,
                is_hot: game.is_hot,
                theme_color: game.theme_color || "#008BFF",
                icon: game.icon || "",
                banner: game.banner || "",
                thumbnail: game.thumbnail || "",
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
                icon: "",
                banner: "",
                thumbnail: "",
            });
        }
    }, [game, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const checked = (e.target as HTMLInputElement).checked;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }

        setFormData((prev) => {
            const nextState = {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };

            // Nếu người dùng đang gõ trường "name", tự động cập nhật "slug" tương ứng
            if (name === "name") {
                nextState.slug = convertToSlug(value);
                if (fieldErrors.slug) {
                    setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.slug;
                        return next;
                    });
                }
            }

            return nextState;
        });
    };

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: "icon" | "thumbnail" | "banner",
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        if (fieldErrors[fieldName]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[fieldName];
                return next;
            });
        }

        try {
            // TODO: Khi có API thật, hãy upload file lên server và lấy URL thật về để lưu vào DB
            // Tạm thời dùng URL.createObjectURL để có thể xem trước chính xác ảnh thật vừa chọn
            const previewUrl = URL.createObjectURL(file);

            setFormData((prev) => ({ ...prev, [fieldName]: previewUrl }));
        } catch (error) {
            setFieldErrors((prev) => ({ ...prev, [fieldName]: "Lỗi tải ảnh lên." }));
            toast.error("Không thể upload ảnh, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = (fieldName: "icon" | "thumbnail" | "banner") => {
        setFormData((prev) => ({ ...prev, [fieldName]: "" }));
        if (fieldErrors[fieldName]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[fieldName];
                return next;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});

        // Validation cơ bản
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) {
            errors.name = "Tên game là bắt buộc.";
        }
        if (!formData.slug.trim()) {
            errors.slug = "Slug (đường dẫn) là bắt buộc.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setIsLoading(false);
            return;
        }

        try {
            if (game) {
                await gameService.updateGame(game.id, formData);
                toast.success("Cập nhật thông tin game thành công!");
            } else {
                await gameService.createGame(formData);
                toast.success("Thêm game mới thành công!");
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err.response?.status === 400 && typeof err.response?.data === "object") {
                const data = err.response.data;
                const parsedErrors: Record<string, string> = {};
                let generalMessage = "Vui lòng sửa các lỗi bên dưới.";
                
                Object.keys(data).forEach((key) => {
                    const val = data[key];
                    if (Array.isArray(val)) {
                        parsedErrors[key] = val.join(" ");
                    } else if (typeof val === "string") {
                        parsedErrors[key] = val;
                    }
                });

                if (Object.keys(parsedErrors).length > 0) {
                    setFieldErrors(parsedErrors);
                    if (data.non_field_errors) {
                        generalMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(" ") : String(data.non_field_errors);
                    } else if (data.detail) {
                        generalMessage = String(data.detail);
                    }
                    toast.error(generalMessage);
                } else {
                    toast.error(err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại.");
                }
            } else {
                toast.error(err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-main">{game ? "Chỉnh sửa Game" : "Thêm Game mới"}</h3>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">
                                Tên Game <span className="text-error">*</span>
                            </Label>
                            <Input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: Liên Quân Mobile"
                                className={cn(fieldErrors.name && "border-error focus-visible:ring-error")}
                            />
                            {fieldErrors.name && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.name}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">
                                Slug (Đường dẫn) <span className="text-error">*</span>
                            </Label>
                            <Input
                                required
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: lien-quan-mobile"
                                className={cn(fieldErrors.slug && "border-error focus-visible:ring-error")}
                            />
                            {fieldErrors.slug && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.slug}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="font-bold text-text-main">Mô tả</Label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className={cn(
                                "block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none text-text-main placeholder:text-text-secondary",
                                fieldErrors.description && "border-error focus:outline-none focus:ring-1 focus:ring-error focus:border-error"
                            )}
                            placeholder="Mô tả ngắn về game..."
                        />
                        {fieldErrors.description && (
                            <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Trạng thái</Label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className={cn(
                                    "block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all text-text-main",
                                    fieldErrors.status && "border-error focus:outline-none focus:ring-1 focus:ring-error focus:border-error"
                                )}
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="HIDDEN">Ẩn</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                            </select>
                            {fieldErrors.status && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.status}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Thứ tự hiển thị</Label>
                            <Input
                                type="number"
                                name="sort_order"
                                value={formData.sort_order}
                                onChange={handleInputChange}
                                className={cn(fieldErrors.sort_order && "border-error focus-visible:ring-error")}
                            />
                            {fieldErrors.sort_order && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.sort_order}</p>
                            )}
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
                                    className={cn("flex-1", fieldErrors.theme_color && "border-error focus-visible:ring-error")}
                                />
                            </div>
                            {fieldErrors.theme_color && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.theme_color}</p>
                            )}
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Trường Icon */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Icon</Label>
                            <div className="flex flex-col gap-2">
                                {formData.icon && (
                                    <div className="relative group w-26 h-26">
                                        <img
                                            src={formData.icon}
                                            alt="Icon preview"
                                            className="w-full h-full object-cover rounded-md border border-border-color"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage("icon")}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 flex items-center justify-center"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <div className="relative flex items-center gap-2">
                                    <Input
                                        type="file"
                                        id="file-icon"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, "icon")}
                                        className="hidden" // Ẩn hoàn toàn input mặc định
                                    />
                                    <label
                                        htmlFor="file-icon"
                                        className={cn(
                                            "inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer transition-colors",
                                            fieldErrors.icon && "border-error text-error"
                                        )}
                                    >
                                        Chọn ảnh
                                    </label>
                                    <span className="text-xs text-text-secondary truncate max-w-[120px]">
                                        {formData.icon ? "Đã tải ảnh lên" : "Chưa có file"}
                                    </span>
                                </div>
                                {fieldErrors.icon && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.icon}</p>
                                )}
                            </div>
                        </div>
                        {/* Trường Thumbnail */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Thumbnail</Label>
                            <div className="flex flex-col gap-2">
                                {formData.thumbnail && (
                                    <div className="relative group w-full h-26">
                                        <img
                                            src={formData.thumbnail}
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-cover rounded-md border border-border-color"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage("thumbnail")}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 flex items-center justify-center"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="file"
                                        id="file-thumbnail"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, "thumbnail")}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="file-thumbnail"
                                        className={cn(
                                            "inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer transition-colors",
                                            fieldErrors.thumbnail && "border-error text-error"
                                        )}
                                    >
                                        Chọn ảnh
                                    </label>
                                    <span className="text-xs text-text-secondary truncate max-w-[120px]">
                                        {formData.thumbnail ? "Đã tải ảnh lên" : "Chưa có file"}
                                    </span>
                                </div>
                                {fieldErrors.thumbnail && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.thumbnail}</p>
                                )}
                            </div>
                        </div>
                        {/* Trường Banner */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Banner</Label>
                            <div className="flex flex-col gap-2">
                                {formData.banner && (
                                    <div className="relative group w-full h-26">
                                        <img
                                            src={formData.banner}
                                            alt="Banner preview"
                                            className="w-full h-full object-cover rounded-md border border-border-color"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage("banner")}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 flex items-center justify-center"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="file"
                                        id="file-banner"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, "banner")}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="file-banner"
                                        className={cn(
                                            "inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer transition-colors",
                                            fieldErrors.banner && "border-error text-error"
                                        )}
                                    >
                                        Chọn ảnh
                                    </label>
                                    <span className="text-xs text-text-secondary truncate max-w-[120px]">
                                        {formData.banner ? "Đã tải ảnh lên" : "Chưa có file"}
                                    </span>
                                </div>
                                {fieldErrors.banner && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.banner}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button type="button" variant="outline" onClick={onClose} className="font-bold px-5">
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="font-bold px-8">
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
