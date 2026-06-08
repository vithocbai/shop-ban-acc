import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Loader2, ImagePlus, RefreshCw, X, UploadCloud, ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { newsService, type Article, type Category } from "@/features/news/services/news.service";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import api from "@/services/api";
import { cn } from "@/lib/utils";

export default function NewsEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form State
    const [formData, setFormData] = useState<Partial<Article>>({
        title: "",
        slug: "",
        category_id: null,
        thumbnail: "",
        short_description: "",
        content: "",
        status: "PUBLISHED",
        is_visible: true,
        priority: 0,
        meta_title: "",
        meta_description: "",
        published_at: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm
        display_until: "",
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch categories
                const cats = await newsService.getCategories();
                setCategories(cats);

                // Fetch article if edit mode
                if (isEditMode) {
                    const article = await newsService.getArticleById(Number(id));
                    setFormData({
                        title: article.title,
                        slug: article.slug,
                        category_id: article.category?.id || null,
                        thumbnail: article.thumbnail || "",
                        short_description: article.short_description || "",
                        content: article.content || "",
                        status: article.status,
                        is_visible: article.is_visible,
                        priority: article.priority,
                        meta_title: article.meta_title || "",
                        meta_description: article.meta_description || "",
                        published_at: article.published_at ? article.published_at.slice(0, 16) : "",
                        display_until: article.display_until ? article.display_until.slice(0, 16) : "",
                    });
                }
            } catch (error) {
                console.error("Lỗi khởi tạo form:", error);
                toast.error("Không thể tải dữ liệu khởi tạo");
                navigate("/admin/news");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, isEditMode, navigate]);

    const handleInputChange = (field: keyof Article, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, thumbnail: "" }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const inputFormData = new FormData();
            inputFormData.append("file", file);
            const response = await api.post("/upload/", inputFormData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const fileUrl = response.data?.url;
            setFormData((prev) => ({ ...prev, thumbnail: fileUrl }));
            toast.success("Tải ảnh lên thành công!");
        } catch (error: any) {
            toast.error("Lỗi tải ảnh lên.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation cơ bản
        if (!formData.title?.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài viết");
            return;
        }
        if (!formData.category_id) {
            toast.error("Vui lòng chọn danh mục");
            return;
        }

        setSaving(true);
        try {
            // Format data before sending
            const payload: any = { ...formData };
            // Ensure proper null format for date times
            if (!payload.published_at) payload.published_at = null;
            if (!payload.display_until) payload.display_until = null;

            if (isEditMode) {
                await newsService.updateArticle(Number(id), payload);
                toast.success("Cập nhật bài viết thành công!");
            } else {
                await newsService.createArticle(payload);
                toast.success("Thêm bài viết mới thành công!");
                navigate("/admin/news");
            }
        } catch (error: any) {
            console.error("Lỗi lưu bài viết:", error);
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi lưu bài viết";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/admin/news")} type="button">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            {isEditMode ? "Chỉnh sửa bài viết" : "Thêm tin tức mới"}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate("/admin/news")} type="button" disabled={saving}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Save className="h-4 w-4" />
                        {isEditMode ? "Lưu thay đổi" : "Lưu tin tức"}
                    </Button>
                </div>
            </div>

            {/* Main Content - 2 Columns */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-y-auto pb-4">
                {/* Left Column - Main Content (70%) */}
                <div className="flex-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="font-medium">
                                        Tiêu đề tin tức <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Nhập tiêu đề..."
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="font-medium">
                                        Danh mục <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.category_id?.toString() || ""}
                                        onValueChange={(v) => handleInputChange("category_id", Number(v))}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="short_desc">
                                    Mô tả ngắn{" "}
                                    <span className="text-text-secondary">(Hiển thị ở trang danh sách tin tức)</span>
                                </Label>
                                <Textarea
                                    id="short_desc"
                                    placeholder="Tóm tắt nội dung bài viết..."
                                    className="resize-none h-30 border border-border-color"
                                    value={formData.short_description}
                                    onChange={(e) => handleInputChange("short_description", e.target.value)}
                                    maxLength={300}
                                />
                                <div className="text-right text-xs text-muted-foreground">
                                    {formData.short_description?.length || 0}/300
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-bold text-text-main flex items-center gap-2">
                                    <ImageIcon size={16} className="text-text-secondary" />
                                    Ảnh đại diện (Thumbnail)
                                </Label>
                                <div
                                    className={cn(
                                        "border-2 border-dashed border-border-color bg-white rounded-lg flex flex-col items-center justify-center text-center hover:bg-bg-secondary/50 transition-colors relative group min-h-[160px] overflow-hidden",
                                        uploading && "opacity-50 cursor-wait"
                                    )}
                                >
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center z-30">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    )}
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
                                                    handleRemoveImage();
                                                }}
                                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 flex items-center justify-center z-20"
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
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                                        title=""
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">
                                    Nội dung chi tiết <span className="text-red-500">*</span>
                                </Label>
                                <RichTextEditor
                                    content={formData.content || ""}
                                    onChange={(content) => handleInputChange("content", content)}
                                    placeholder="Nhập nội dung chi tiết tin tức..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Settings & SEO (30%) */}
                <div className="w-full lg:w-[350px] shrink-0 space-y-6">
                    {/* Publish Settings */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Cài đặt xuất bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-2">
                                <Label className="">Trạng thái</Label>
                                <RadioGroup
                                    value={formData.status}
                                    onValueChange={(v) => handleInputChange("status", v)}
                                    className="flex justify-around space-y-1"
                                >
                                    <div className="flex items-center space-x-2 mt-1">
                                        <RadioGroupItem value="PUBLISHED" id="r1" />
                                        <Label htmlFor="r1" className="cursor-pointer">
                                            Đăng ngay
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="DRAFT" id="r2" />
                                        <Label htmlFor="r2" className="cursor-pointer">
                                            Lưu nháp
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label>Thời gian đăng</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.published_at || ""}
                                    onChange={(e) => handleInputChange("published_at", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Hiển thị đến (Tuỳ chọn)</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.display_until || ""}
                                    onChange={(e) => handleInputChange("display_until", e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Độ ưu tiên</Label>
                                    <Input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => handleInputChange("priority", parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Trạng thái hiển thị</Label>
                                    <Select
                                        value={formData.is_visible ? "true" : "false"}
                                        onValueChange={(v) => handleInputChange("is_visible", v === "true")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Hiển thị</SelectItem>
                                            <SelectItem value="false">Ẩn</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tùy chỉnh SEO</CardTitle>
                            <CardDescription>Bỏ trống để tự động tạo</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>URL thân thiện (Slug)</Label>
                                <Input
                                    placeholder="vd: ten-bai-viet-hay"
                                    value={formData.slug}
                                    onChange={(e) => handleInputChange("slug", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Thẻ meta tiêu đề</Label>
                                <Input
                                    placeholder="Tiêu đề SEO..."
                                    value={formData.meta_title}
                                    onChange={(e) => handleInputChange("meta_title", e.target.value)}
                                    maxLength={60}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Thẻ meta mô tả</Label>
                                <Textarea
                                    placeholder="Mô tả SEO..."
                                    className="resize-none h-20 border border-border-color"
                                    value={formData.meta_description}
                                    onChange={(e) => handleInputChange("meta_description", e.target.value)}
                                    maxLength={160}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
