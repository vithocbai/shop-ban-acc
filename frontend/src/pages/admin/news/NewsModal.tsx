import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, UploadCloud, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/services/api";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { newsService, type Article, type Category } from "@/features/news/services/news.service";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    article?: Article | null;
    categories: Category[];
}

export default function NewsModal({ isOpen, onClose, onSuccess, article, categories }: NewsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        title: "",
        category_id: "",
        short_description: "",
        thumbnail: "",
        content: "",
        status: "PUBLISHED",
        priority: 0,
        schedule_type: "NOW",
        published_at: "",
        display_until: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFieldErrors({});
            if (article) {
                setFormData({
                    title: article.title || "",
                    category_id: article.category?.id?.toString() || article.category_id?.toString() || "",
                    short_description: article.short_description || "",
                    thumbnail: article.thumbnail || "",
                    content: article.content || "",
                    status: article.status || "PUBLISHED",
                    priority: article.priority || 0,
                    schedule_type: article.published_at ? "SCHEDULE" : "NOW",
                    published_at: article.published_at || "",
                    display_until: article.display_until || "",
                });
            } else {
                setFormData({
                    title: "",
                    category_id: "",
                    short_description: "",
                    thumbnail: "",
                    content: "",
                    status: "PUBLISHED",
                    priority: 0,
                    schedule_type: "NOW",
                    published_at: "",
                    display_until: "",
                });
            }
        }
    }, [isOpen, article]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await api.post("/upload/", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData(prev => ({ ...prev, thumbnail: res.data?.url || "" }));
            if (fieldErrors.thumbnail) setFieldErrors(prev => ({ ...prev, thumbnail: "" }));
            toast.success("Upload ảnh thành công!");
        } catch (error) {
            toast.error("Lỗi upload ảnh");
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors: Record<string, string> = {};
        if (!formData.title.trim()) errors.title = "Vui lòng nhập tiêu đề tin tức";
        if (!formData.category_id) errors.category_id = "Vui lòng chọn danh mục";
        if (!formData.thumbnail) errors.thumbnail = "Vui lòng tải lên ảnh đại diện";
        if (!formData.content || formData.content === "<p></p>") errors.content = "Vui lòng nhập nội dung chi tiết";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        
        setFieldErrors({});
        setIsLoading(true);
        try {
            const payload: any = {
                ...formData,
                is_visible: formData.status === "PUBLISHED",
                published_at: formData.schedule_type === "SCHEDULE" && formData.published_at 
                    ? new Date(formData.published_at).toISOString() 
                    : null,
                display_until: formData.display_until 
                    ? new Date(formData.display_until).toISOString() 
                    : null,
            };

            // Remove internal UI state before sending
            delete payload.schedule_type;

            if (article?.id) {
                await newsService.updateArticle(article.id, payload);
                toast.success("Cập nhật bài viết thành công!");
            } else {
                await newsService.createArticle(payload);
                toast.success("Thêm bài viết mới thành công!");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-[1100px] max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-xl font-medium text-text-main">
                        {article ? "Chỉnh sửa tin tức" : "Thêm tin tức"}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer">
                        <X size={20} />
                    </Button>
                </div>

                {/* Form */}
                <form id="news-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-bg-secondary/20">
                    <div className="flex flex-col lg:flex-row gap-6 px-6 py-4">
                        {/* Cột trái: Thông tin cơ bản */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h4 className="font-medium text-text-main text-base mb-2">Thông tin cơ bản</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-medium text-text-main">Tiêu đề <span className="text-error">*</span></Label>
                                        <Input
                                            placeholder="Nhập tiêu đề tin tức..."
                                            value={formData.title}
                                            onChange={e => {
                                                setFormData({ ...formData, title: e.target.value });
                                                if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: "" });
                                            }}
                                            className={cn(fieldErrors.title && "border-error focus-visible:ring-error")}
                                        />
                                        {fieldErrors.title && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.title}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-medium text-text-main">Danh mục <span className="text-error">*</span></Label>
                                        <Select
                                            value={formData.category_id}
                                            onValueChange={value => {
                                                setFormData({ ...formData, category_id: value });
                                                if (fieldErrors.category_id) setFieldErrors({ ...fieldErrors, category_id: "" });
                                            }}
                                        >
                                            <SelectTrigger className={cn("w-full bg-white h-[42px]", fieldErrors.category_id ? "border-error focus:ring-error" : "border-border-color")}>
                                                <SelectValue placeholder="Chọn danh mục" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldErrors.category_id && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.category_id}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-text-main">Mô tả ngắn <span className="text-text-secondary font-normal text-xs ml-1">(Hiển thị ở trang danh sách tin tức)</span></Label>
                                <textarea
                                    placeholder="Nhập mô tả ngắn..."
                                    value={formData.short_description}
                                    onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                                    className="block w-full px-4 py-2.5 bg-white border border-border-color rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all text-text-main resize-none placeholder:text-text-secondary"
                                    rows={4}
                                    maxLength={255}
                                />
                                <div className="text-right text-xs text-text-secondary mt-1">
                                    {formData.short_description.length}/255
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-text-main">Ảnh đại diện <span className="text-error">*</span></Label>
                                <div
                                    className={cn(
                                        "border-2 border-dashed bg-white rounded-lg flex flex-col items-center justify-center text-center hover:bg-bg-secondary/50 transition-colors relative group min-h-[160px] overflow-hidden",
                                        fieldErrors.thumbnail ? "border-error" : "border-border-color",
                                        isUploading && "opacity-50 cursor-wait"
                                    )}
                                >
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center z-30">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    )}
                                    {formData.thumbnail ? (
                                        <>
                                            <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-contain max-h-[200px]" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 gap-2">
                                                <label className="bg-white text-text-main px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                                                    Đổi ảnh
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                                                </label>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setFormData({ ...formData, thumbnail: "" });
                                                }}
                                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 flex items-center justify-center z-20 cursor-pointer"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-6">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <UploadCloud size={24} />
                                            </div>
                                            <p className="text-sm text-text-main font-medium mb-1">Kéo thả ảnh vào đây hoặc</p>
                                            <span className="text-primary text-sm font-medium border border-border-color rounded-md px-3 py-1 mt-1">Chọn ảnh</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                                        </label>
                                    )}
                                </div>
                                {fieldErrors.thumbnail && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.thumbnail}</p>}
                                <p className="text-xs text-text-secondary mt-1">Định dạng: JPG, PNG, WEBP. Kích thước tối đa 2MB. Tỷ lệ khuyến nghị 16:9</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-text-main">Nội dung chi tiết <span className="text-error">*</span></Label>
                                <div className={cn(fieldErrors.content && "border border-error rounded-md")}>
                                    <RichTextEditor 
                                        content={formData.content} 
                                        onChange={(html) => {
                                            setFormData({ ...formData, content: html });
                                            if (fieldErrors.content) setFieldErrors({ ...fieldErrors, content: "" });
                                        }} 
                                    />
                                </div>
                                {fieldErrors.content && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.content}</p>}
                            </div>
                        </div>

                        {/* Cột phải: Cài đặt hiển thị */}
                        <div className="w-full lg:w-[320px] shrink-0 space-y-4">
                            {/* Panel: Cài đặt hiển thị */}
                            <div className="bg-bg-secondary/30 p-5 rounded-lg border border-border-color space-y-2">
                                <h4 className="font-medium text-text-main text-base">Cài đặt hiển thị</h4>
                                
                                <div className="space-y-3">
                                    <Label className="font-medium text-text-main">Trạng thái <span className="text-error">*</span></Label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                                            <input
                                                type="radio"
                                                checked={formData.status === "PUBLISHED"}
                                                onChange={() => setFormData({ ...formData, status: "PUBLISHED" })}
                                                className="w-4 h-4 text-primary cursor-pointer accent-primary"
                                            />
                                            <span className="text-sm font-medium text-text-main select-none">Hiển thị</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={formData.status === "DRAFT"}
                                                onChange={() => setFormData({ ...formData, status: "DRAFT" })}
                                                className="w-4 h-4 text-primary cursor-pointer accent-primary"
                                            />
                                            <span className="text-sm font-medium text-text-main select-none">Ẩn</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label className="font-medium text-text-main">Thứ tự hiển thị</Label>
                                    <Input
                                        type="number"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                        className="bg-white mt-1"
                                    />
                                    <p className="text-xs text-text-secondary">Số càng lớn, thứ tự hiển thị càng cao</p>
                                </div>
                            </div>

                            {/* Panel: Lên lịch đăng */}
                            <div className="bg-bg-secondary/30 p-5 rounded-lg border border-border-color space-y-4">
                                <h4 className="font-medium text-text-main text-base">Lên lịch đăng</h4>
                                
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.schedule_type === "NOW"}
                                            onChange={() => setFormData({ ...formData, schedule_type: "NOW" })}
                                            className="w-4 h-4 text-primary cursor-pointer accent-primary"
                                        />
                                        <span className="text-sm font-medium text-text-main select-none">Đăng ngay</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.schedule_type === "SCHEDULE"}
                                            onChange={() => setFormData({ ...formData, schedule_type: "SCHEDULE" })}
                                            className="w-4 h-4 text-primary cursor-pointer accent-primary"
                                        />
                                        <span className="text-sm font-medium text-text-main select-none">Đặt lịch đăng</span>
                                    </label>
                                </div>

                                {formData.schedule_type === "SCHEDULE" && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label className="font-medium text-text-main text-sm">Ngày giờ đăng <span className="text-error">*</span></Label>
                                        <DateTimePicker
                                            value={formData.published_at ? new Date(formData.published_at) : undefined}
                                            onChange={date => setFormData({ ...formData, published_at: date ? date.toISOString() : "" })}
                                            placeholder="Chọn thời gian đăng"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 pt-2 border-t border-border-color">
                                    <Label className="font-medium text-text-main text-sm">Hiển thị đến (Tùy chọn)</Label>
                                    <DateTimePicker
                                        value={formData.display_until ? new Date(formData.display_until) : undefined}
                                        onChange={date => setFormData({ ...formData, display_until: date ? date.toISOString() : "" })}
                                        placeholder="Để trống nếu không có thời hạn"
                                    />
                                    <p className="text-xs text-text-secondary mt-1">Hết hạn sẽ tự động ẩn bài viết</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button variant="outline" onClick={onClose} className="font-medium px-5" disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button type="submit" form="news-form" className="font-medium px-8 text-white gap-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu tin tức
                    </Button>
                </div>
            </div>
        </div>
    );
}
