import React, { useState, useEffect } from "react";
import {
    X,
    Save,
    Loader2,
    Plus,
    Trash2,
    UploadCloud,
    Image as ImageIcon,
    Gamepad2,
    RefreshCw,
} from "lucide-react";
import type { Account, AccountCreateInput, AccountStatus } from "../types";
import { INITIAL_ACCOUNT_FORM } from "../types";
import type { Game } from "../../game/types";
import { accountService } from "../services/account.service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import api from "@/services/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { STATUS_CONFIG } from "./AccountList";

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    account?: Account | null;
    gameList: Game[];
}

// Hàm chuyển đổi chuỗi tiếng Việt thành Slug chuẩn
const convertToSlug = (text: string): string => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSuccess, account, gameList }) => {
    const [formData, setFormData] = useState<AccountCreateInput>(() => {
        if (account) {
            return {
                game: account.game && typeof account.game === 'object' ? (account.game as any).id : (account.game || 0),
                title: account.title,
                slug: account.slug,
                account_code: account.account_code,
                thumbnail: account.thumbnail || "",
                price: Number(account.price) || 0,
                original_price: account.original_price ? Number(account.original_price) : 0,
                discount_percent: account.discount_percent || 0,
                status: account.status,
                login_type: account.login_type || "",
                account_type: account.account_type || "",
                short_description: account.short_description || "",
                description: account.description || "",
                account_data: account.account_data || {},
                is_featured: account.is_featured,
                is_hot: account.is_hot,
                views: account.views,
                images: (account.images || []).map((img) => ({
                    image_url: img.image_url,
                    sort_order: img.sort_order,
                })),
            };
        }
        return { ...INITIAL_ACCOUNT_FORM };
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // JSONB key-value editor state (hỗ trợ schema động)
    const [jsonEntries, setJsonEntries] = useState<{
        key: string;
        value: string;
        label?: string;
        isSchema?: boolean;
        type?: "text" | "number" | "select";
        options?: string[];
    }[]>([]);

    // Gallery state
    const [galleryUrls, setGalleryUrls] = useState<{ image_url: string; sort_order: number }[]>(() => {
        if (account && account.images) {
            return account.images.map((img) => ({
                image_url: img.image_url,
                sort_order: img.sort_order,
            }));
        }
        return [];
    });

    // Bỏ useEffect đầu tiên vì đã khởi tạo state trực tiếp từ prop (lazy initialization).
    // Modal luôn bị unmount khi đóng (if (!isOpen) return null;) nên state luôn được làm mới.

    // Lắng nghe thay đổi của game để generate form thuộc tính động
    useEffect(() => {
        if (!isOpen) return;

        const selectedGame = gameList.find((g) => g.id === Number(formData.game));
        const schema = selectedGame?.attributes_schema || [];
        
        // Data hiện tại (từ account edit hoặc formData cũ)
        const currentData = account?.account_data || {};

        // Tạo danh sách entry từ schema
        const schemaEntries = schema.map((attr) => ({
            key: attr.key,
            label: attr.label,
            isSchema: true,
            type: attr.type,
            options: attr.options,
            value: currentData[attr.key] !== undefined ? String(currentData[attr.key]) : "",
        }));

        // Giữ lại các entry custom không nằm trong schema
        const customEntries = Object.entries(currentData)
            .filter(([k]) => !schema.find((attr) => attr.key === k))
            .map(([k, v]) => ({
                key: k,
                value: String(v),
                isSchema: false,
            }));

        setJsonEntries([...schemaEntries, ...customEntries]);
    }, [formData.game, isOpen, account, gameList]);

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
                [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
            };
            if (name === "title") {
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

    // --- File Upload ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "thumbnail") => {
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
            const inputFormData = new FormData();
            inputFormData.append("file", file);
            const response = await api.post("/upload/", inputFormData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const fileUrl = response.data?.url;
            setFormData((prev) => ({ ...prev, [fieldName]: fileUrl }));
            toast.success("Tải ảnh lên thành công!");
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Lỗi tải ảnh lên.";
            setFieldErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
            toast.error(`Không thể upload ảnh: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = (fieldName: "thumbnail") => {
        setFormData((prev) => ({ ...prev, [fieldName]: "" }));
    };

    // --- Gallery Upload ---
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const response = await api.post("/upload/", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const fileUrl = response.data?.url;
            setGalleryUrls((prev) => [...prev, { image_url: fileUrl, sort_order: prev.length }]);
            toast.success("Thêm ảnh gallery thành công!");
        } catch (error: any) {
            toast.error("Không thể upload ảnh gallery.");
        } finally {
            setIsLoading(false);
            // Reset input file
            e.target.value = "";
        }
    };

    const handleRemoveGallery = (index: number) => {
        setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
    };

    // --- JSONB Key-Value ---
    const handleAddJsonEntry = () => {
        setJsonEntries((prev) => [...prev, { key: "", value: "" }]);
    };

    const handleJsonEntryChange = (index: number, field: "key" | "value", val: string) => {
        setJsonEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: val } : entry)));
    };

    const handleRemoveJsonEntry = (index: number) => {
        setJsonEntries((prev) => prev.filter((_, i) => i !== index));
    };

    // --- Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});

        // Client validation
        const errors: Record<string, string> = {};
        if (!formData.title.trim()) errors.title = "Tiêu đề là bắt buộc.";
        if (!formData.slug.trim()) errors.slug = "Slug là bắt buộc.";
        if (!formData.account_code.trim()) errors.account_code = "Mã tài khoản là bắt buộc.";
        if (!formData.game || formData.game === 0) errors.game = "Vui lòng chọn game.";
        if (!formData.price || formData.price <= 0) errors.price = "Giá bán phải lớn hơn 0.";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setIsLoading(false);
            return;
        }

        // Build account_data from JSONB entries
        const accountData: Record<string, any> = {};
        jsonEntries.forEach((entry) => {
            if (entry.key.trim()) {
                accountData[entry.key.trim()] = entry.value;
            }
        });

        const submitData: AccountCreateInput = {
            ...formData,
            account_data: accountData,
            images: galleryUrls,
        };

        try {
            if (account) {
                await accountService.updateAccount(account.id, submitData);
                toast.success("Cập nhật tài khoản thành công!");
            } else {
                await accountService.createAccount(submitData);
                toast.success("Thêm tài khoản mới thành công!");
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err.response?.status === 400 && typeof err.response?.data === "object") {
                const data = err.response.data;
                const parsedErrors: Record<string, string> = {};
                Object.keys(data).forEach((key) => {
                    const val = data[key];
                    if (Array.isArray(val)) parsedErrors[key] = val.join(" ");
                    else if (typeof val === "string") parsedErrors[key] = val;
                });
                if (Object.keys(parsedErrors).length > 0) {
                    setFieldErrors(parsedErrors);
                    toast.error("Vui lòng sửa các lỗi bên dưới.");
                } else {
                    toast.error(err.response?.data?.message || "Đã có lỗi xảy ra.");
                }
            } else {
                toast.error(err.response?.data?.message || "Đã có lỗi xảy ra.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
  
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-white z-10">
                    <h3 className="text-lg font-bold text-text-main">
                        {account ? "Chỉnh sửa Tài khoản" : "Thêm Tài khoản mới"}
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

                {/* Split Layout Container */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-bg-secondary/10">
                    {/* Cột trái: Form Nhập Liệu */}
                    <form
                        id="account-form"
                        onSubmit={handleSubmit}
                        className="flex-1 overflow-y-auto p-4 space-y-5 border-r border-border-color bg-white"
                    >
                        {/* Hàng 1: Game, Mã tài khoản */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Game */}
                            <div className="space-y-1.5">
                                <Label className="font-bold text-text-main">
                                    Game <span className="text-error">*</span>
                                </Label>
                                <Select
                                    value={formData.game ? String(formData.game) : undefined}
                                    onValueChange={(val) => {
                                        if (fieldErrors.game) {
                                            setFieldErrors((prev) => {
                                                const next = { ...prev };
                                                delete next.game;
                                                return next;
                                            });
                                        }
                                        setFormData((prev) => ({ ...prev, game: Number(val) }));
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "w-full px-4 py-5 bg-bg-secondary border border-border-color rounded-md text-sm text-text-main",
                                            fieldErrors.game &&
                                                "border-error focus:ring-1 focus:ring-error focus:border-error"
                                        )}
                                    >
                                        <SelectValue placeholder="-- Chọn game --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gameList.map((g) => (
                                            <SelectItem key={g.id} value={String(g.id)}>
                                                {g.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.game && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.game}</p>
                                )}
                            </div>

                            {/* Mã tài khoản */}
                            <div className="space-y-1.5">
                                <Label className="font-bold text-text-main">
                                    Mã tài khoản <span className="text-error">*</span>
                                </Label>
                                <Input
                                    name="account_code"
                                    value={formData.account_code}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: ACC12345"
                                    className={cn(fieldErrors.account_code && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.account_code && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.account_code}</p>
                                )}
                            </div>

                            {/* Tiêu đề */}
                            <div className="space-y-1.5">
                                <Label className="font-bold text-text-main">
                                    Tiêu đề <span className="text-error">*</span>
                                </Label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Tài khoản siêu VIP rank Thách Đấu..."
                                    className={cn(fieldErrors.title && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.title && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.title}</p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="space-y-1.5">
                                <Label className="font-bold text-text-main">
                                    Slug (Đường dẫn) <span className="text-error">*</span>
                                </Label>
                                <Input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: tai-khoan-sieu-vip-rank-thach-dau"
                                    className={cn(fieldErrors.slug && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.slug && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.slug}</p>
                                )}
                            </div>
                        </div>

                        {/* Hàng 2: Giá & Khuyến mại */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-1.5">
                                <Label className="font-bold text-text-main">
                                    Giá bán (VNĐ) <span className="text-error">*</span>
                                </Label>
                                <Input
                                    required
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className={cn(fieldErrors.price && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.price && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.price}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold text-text-main">
                                    Giá gốc (VNĐ) <span className="text-error">*</span>
                                </Label>
                                <Input
                                    required
                                    type="number"
                                    name="original_price"
                                    value={formData.original_price}
                                    onChange={handleInputChange}
                                    className={cn(
                                        fieldErrors.original_price && "border-error focus-visible:ring-error",
                                    )}
                                />
                                {fieldErrors.original_price && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.original_price}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold text-text-main">Giảm giá (%)</Label>
                                <Input
                                    type="number"
                                    name="discount_percent"
                                    value={formData.discount_percent}
                                    onChange={handleInputChange}
                                    className={cn(
                                        fieldErrors.discount_percent && "border-error focus-visible:ring-error",
                                    )}
                                    min={0}
                                    max={100}
                                />
                                {fieldErrors.discount_percent && (
                                    <p className="text-[12px] text-error mt-0.5 italic">
                                        {fieldErrors.discount_percent}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Hàng 3: Phân loại */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                            <div className="space-y-1.5">
                                <Label className="font-bold text-text-main">Trạng thái</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => {
                                        if (fieldErrors.status) {
                                            setFieldErrors((prev) => {
                                                const next = { ...prev };
                                                delete next.status;
                                                return next;
                                            });
                                        }
                                        setFormData((prev) => ({ ...prev, status: val as AccountStatus }));
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "w-full px-4 py-5 bg-bg-secondary border border-border-color rounded-md text-sm text-text-main",
                                            fieldErrors.status &&
                                                "border-error focus:ring-1 focus:ring-error focus:border-error"
                                        )}
                                    >
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AVAILABLE">Đang bán</SelectItem>
                                        <SelectItem value="RESERVED">Đang giữ chỗ</SelectItem>
                                        <SelectItem value="SOLD">Đã bán</SelectItem>
                                        <SelectItem value="LOCKED">Đang khóa</SelectItem>
                                        <SelectItem value="HIDDEN">Tạm ẩn</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.status && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.status}</p>
                                )}
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_hot"
                                    checked={formData.is_hot}
                                    onChange={handleInputChange as any}
                                    className="w-4 h-4 text-primary rounded border-border-color focus:ring-primary/20 cursor-pointer"
                                />
                                <span className="text-sm font-bold text-text-main select-none">Tài khoản HOT</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleInputChange as any}
                                    className="w-4 h-4 text-primary rounded border-border-color focus:ring-primary/20 cursor-pointer"
                                />
                                <span className="text-sm font-bold text-text-main select-none">Tài khoản Nổi bật</span>
                            </label>
                        </div>

                        {/* Hàng 4: Hình ảnh Media */}
                        {/* Upload Thumbnail */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main flex items-center gap-2">
                                <ImageIcon size={16} className="text-text-secondary" />
                                Ảnh đại diện (Thumbnail)
                            </Label>
                            <div
                                className={cn(
                                    "border-2 border-dashed border-border-color bg-white rounded-lg flex flex-col items-center justify-center text-center hover:bg-bg-secondary/50 transition-colors relative group min-h-[160px] overflow-hidden",
                                    fieldErrors.thumbnail && "border-error bg-error/5",
                                )}
                            >
                                {formData.thumbnail ? (
                                    <>
                                        <img
                                            src={formData.thumbnail}
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-cover absolute inset-0"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                                            <span className="text-white font-medium text-sm flex items-center gap-2">
                                                <RefreshCw size={16} /> Đổi ảnh khác
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleRemoveImage("thumbnail");
                                            }}
                                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error flex items-center justify-center z-20"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="pointer-events-none p-6">
                                        <UploadCloud size={32} className="text-text-secondary mb-2 mx-auto" />
                                        <p className="text-sm font-bold text-text-main mb-1">
                                            Kéo thả hoặc click vào đây
                                        </p>
                                        <p className="text-xs text-text-secondary">Hỗ trợ JPG, PNG, WEBP</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="file-thumbnail-account"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "thumbnail")}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                                    title=""
                                />
                            </div>
                            {fieldErrors.thumbnail && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.thumbnail}</p>
                            )}
                        </div>

                        {/* Upload Gallery */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main flex items-center gap-2">
                                <Gamepad2 size={16} className="text-text-secondary" />
                                Bộ sưu tập ảnh ({galleryUrls.length})
                            </Label>
                            <div className="border-2 border-dashed border-border-color bg-white rounded-lg hover:bg-bg-secondary/50 transition-colors relative group min-h-[100px] flex flex-col items-center justify-center p-4">
                                <div className="pointer-events-none flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-full shadow-sm border border-border-color">
                                        <Plus size={20} className="text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-text-main">Thêm ảnh Gallery</p>
                                        <p className="text-xs text-text-secondary">Upload nhiều ảnh cùng lúc</p>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    id="file-gallery-account"
                                    accept="image/*"
                                    onChange={handleGalleryUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                                    title=""
                                    multiple
                                />
                            </div>

                            {/* Danh sách ảnh đã upload */}
                            {galleryUrls.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {galleryUrls.map((img, index) => (
                                        <div key={index} className="relative group w-[70px] h-[70px]">
                                            <img
                                                src={img.image_url}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-full h-full object-cover rounded-md border border-border-color"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGallery(index)}
                                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error flex items-center justify-center"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Hàng 4: Mô tả */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Mô tả ngắn</Label>
                            <textarea
                                name="short_description"
                                value={formData.short_description || ""}
                                onChange={handleInputChange as any}
                                rows={2}
                                className={cn(
                                    "block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none text-text-main placeholder:text-text-secondary",
                                    fieldErrors.short_description &&
                                        "border-error focus:outline-none focus:ring-1 focus:ring-error focus:border-error",
                                )}
                                placeholder="Mô tả ngắn gọn về tài khoản..."
                            />
                            {fieldErrors.short_description && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.short_description}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Mô tả chi tiết</Label>
                            <textarea
                                name="description"
                                value={formData.description || ""}
                                onChange={handleInputChange as any}
                                rows={4}
                                className={cn(
                                    "block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none text-text-main placeholder:text-text-secondary",
                                    fieldErrors.description &&
                                        "border-error focus:outline-none focus:ring-1 focus:ring-error focus:border-error",
                                )}
                                placeholder="Mô tả chi tiết, thông tin đăng nhập, ghi chú..."
                            />
                            {fieldErrors.description && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.description}</p>
                            )}
                        </div>

                        {/* Hàng 5: Thuộc tính Game (Dữ liệu động) */}
                        <div className="space-y-1.5 mt-4 border-t border-border-color pt-4">
                            <Label className="font-bold text-text-main text-base">Thuộc tính Game</Label>
                            <p className="text-xs text-text-secondary mb-3">
                                Các thuộc tính đặc trưng theo Game đã chọn. Bạn có thể thêm thuộc tính tùy chỉnh nếu cần.
                            </p>
                            {jsonEntries.map((entry, index) => (
                                <div key={index} className="flex gap-2 items-start mb-3 bg-bg-secondary p-3 rounded-md border border-border-color/50">
                                    <div className="w-1/3">
                                        {entry.isSchema ? (
                                            <div>
                                                <Label className="font-semibold text-sm mb-1 block">
                                                    {entry.label || entry.key} <span className="text-xs text-text-secondary font-normal">({entry.key})</span>
                                                </Label>
                                            </div>
                                        ) : (
                                            <Input
                                                placeholder="Tên thuộc tính (VD: rank)"
                                                value={entry.key}
                                                onChange={(e) => handleJsonEntryChange(index, "key", e.target.value)}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 flex gap-2">
                                        {entry.isSchema && entry.type === "select" && entry.options ? (
                                            <Select
                                                value={entry.value}
                                                onValueChange={(val) => handleJsonEntryChange(index, "value", val)}
                                            >
                                                <SelectTrigger className="w-full bg-white border border-border-color text-text-main py-5">
                                                    <SelectValue placeholder={`Chọn ${(entry.label || entry.key).toLowerCase()}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {entry.options.map(opt => (
                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                type={entry.type === "number" ? "number" : "text"}
                                                placeholder={entry.isSchema ? `Nhập ${(entry.label || entry.key).toLowerCase()}...` : "Giá trị"}
                                                value={entry.value}
                                                onChange={(e) => handleJsonEntryChange(index, "value", e.target.value)}
                                                className="bg-white"
                                            />
                                        )}
                                        
                                        {!entry.isSchema && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveJsonEntry(index)}
                                                className="text-error hover:text-error hover:bg-error/10 shrink-0 h-9 w-9"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddJsonEntry}
                                className="text-xs gap-1.5 font-bold mt-2"
                            >
                                <Plus size={14} />
                                Thêm thuộc tính tùy chỉnh
                            </Button>
                        </div>
                    </form>

                    {/* Cột phải: Hình ảnh & Xem trước */}
                    <div className="w-full md:w-[380px] lg:w-[420px] p-4 overflow-y-auto flex flex-col gap-6">
                        {/* Live Preview Card */}
                        <div className="flex-1 flex flex-col gap-3">
                            {/* 1. Thẻ hiển thị chính */}
                            <div className="bg-white border border-border-color rounded-lg overflow-hidden flex flex-col shadow-sm mx-auto p-4  w-full">
                                <h4 className="font-bold text-sm text-text-main mb-3">Xem trước thẻ tài khoản</h4>
                                <div className="h-40 bg-bg-secondary relative flex items-center justify-center border-b border-border-color">
                                    {formData.thumbnail ? (
                                        <img
                                            src={formData.thumbnail}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ImageIcon size={32} className="text-text-secondary/30" />
                                    )}
                                    {formData.is_hot && (
                                        <span className="absolute top-2 left-2 bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-sm">
                                            Hot
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 flex flex-col justify-between">
                                    <div>
                                        <div className="text-[12px] text-text-secondary uppercase mb-1 font-medium flex items-center justify-between">
                                            <span>Mã: {formData.account_code || ""}</span>
                                            {formData.is_featured && <span className="text-primary">VIP</span>}
                                        </div>
                                        <h5 className="font-bold text-text-main text-sm line-clamp-2 leading-tight h-10">
                                            {formData.title || "Tên tài khoản sẽ hiển thị tại đây..."}
                                        </h5>
                                    </div>
                                    <div></div>
                                    <div className="mt-3 pt-3 border-t border-border-color border-dashed flex items-end justify-between">
                                        <div>
                                            <div className="items-center gap-1 flex">
                                                <div>
                                                    {(formData.discount_percent || 0) > 0 && (
                                                        <div className="text-text-secondary text-sm line-through font-medium">
                                                            {formData.original_price
                                                                ? formData.original_price.toLocaleString() + "đ"
                                                                : ""}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="px-2 text-xs font-bold text-white shadow-sm bg-error">
                                                    {formData.discount_percent}%
                                                </span>
                                            </div>
                                            <div className="text-error font-bold text-base leading-none mt-1">
                                                {formData.price ? formData.price.toLocaleString() + "đ" : "0đ"}
                                            </div>
                                        </div>
                                        <div className="text-text-secondary text-sm px-3 py-1.5 font-medium">
                                            {formData.views ? formData.views + " lượt xem" : "0 lượt xem"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Thông tin tóm tắt (Khối bạn cần thêm) */}
                            <div className="bg-white border border-border-color rounded-lg p-4 shadow-sm">
                                <h4 className="font-bold text-sm text-text-main mb-3">Thông tin tóm tắt</h4>
                                <div className="text-xs space-y-2.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary font-medium">Game</span>
                                        <span className="font-medium text-text-main">
                                            {gameList.find((g) => g.id === Number(formData.game))?.name ||
                                                "Liên Quân Mobile"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary font-medium">Mã tài khoản</span>
                                        <span className="font-medium text-text-main">
                                            {formData.account_code || "---"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary font-medium">Giá bán</span>
                                        <span className="font-bold text-text-main">
                                            {formData.price ? formData.price.toLocaleString() + "đ" : "0đ"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary font-medium">Giá gốc</span>
                                        <span className="font-medium text-text-main">
                                            {formData.original_price
                                                ? formData.original_price.toLocaleString() + "đ"
                                                : "0đ"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary font-medium">Giảm giá</span>
                                        <span className="font-medium text-text-main">{formData.discount_percent}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary font-medium">Trạng thái</span>
                                        <span
                                            className={cn(
                                                "font-bold px-2 py-0.5 text-[10px] rounded",
                                                STATUS_CONFIG[formData.status || "AVAILABLE"]?.className || "bg-gray-100 text-gray-700 border-gray-200",
                                            )}
                                        >
                                            {STATUS_CONFIG[formData.status || "AVAILABLE"]?.label || formData.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary font-medium">Tài khoản hot</span>
                                        <span className="font-medium text-text-main flex items-center gap-0.5">
                                            {formData.is_hot ? "Có 🔥" : "Không"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary font-medium">Tài khoản nổi bật</span>
                                        <span className="font-medium text-text-main">
                                            {formData.is_featured ? "Có" : "Không"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Ảnh gallery */}
                            <div className="bg-white border border-border-color rounded-lg p-4 shadow-sm">
                                <h4 className="font-bold text-sm text-text-main mb-3">
                                    Ảnh gallery ({galleryUrls.length})
                                </h4>
                                {galleryUrls.length > 0 ? (
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {galleryUrls.slice(0, 5).map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="relative aspect-square rounded-md overflow-hidden border border-border-color"
                                            >
                                                <img
                                                    src={img.image_url}
                                                    alt="Gallery item"
                                                    className="w-full h-full object-cover"
                                                />
                                                {idx === 4 && galleryUrls.length > 5 && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                                        +{galleryUrls.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs italic text-text-secondary">Chưa có ảnh trong bộ sưu tập</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-white z-10">
                    <Button type="button" variant="outline" onClick={onClose} className="font-bold px-5">
                        Hủy bỏ
                    </Button>
                    <Button type="submit" form="account-form" disabled={isLoading} className="font-bold px-8">
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <Save size={18} className="mr-2" />
                                {account ? "Lưu thay đổi" : "Tạo tài khoản"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AccountModal;
