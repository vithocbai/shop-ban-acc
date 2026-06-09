import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, UploadCloud, Loader2, Save, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/services/api";
import { cn } from "@/lib/utils";
import { bannerService, type Banner } from "@/features/banner/services/banner.service";
import { DateTimePicker } from "@/components/ui/date-time-picker";

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    banner?: Banner | null;
}

export default function BannerModal({ isOpen, onClose, onSuccess, banner }: BannerModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        title: "",
        position: "HOME_TOP",
        link_url: "",
        sort_order: 0,
        image_url: "",
        description: "",
        is_active: true,
        devices: ["Desktop", "Tablet", "Mobile"],
        show_in_home: true,
        start_date: "",
        end_date: "",
        note: ""
    });

    useEffect(() => {
        if (isOpen) {
            setFieldErrors({});
            if (banner) {
                setFormData({
                    title: banner.title || "",
                    position: banner.position || "HOME_TOP",
                    link_url: banner.link_url || "",
                    sort_order: banner.sort_order || 0,
                    image_url: banner.image_url || "",
                    description: banner.description || "",
                    is_active: banner.is_active,
                    devices: banner.devices?.length ? banner.devices : ["Desktop", "Tablet", "Mobile"],
                    show_in_home: banner.show_in_home,
                    start_date: banner.start_date || "",
                    end_date: banner.end_date || "",
                    note: banner.note || ""
                });
            } else {
                setFormData({
                    title: "",
                    position: "HOME_TOP",
                    link_url: "",
                    sort_order: 0,
                    image_url: "",
                    description: "",
                    is_active: true,
                    devices: ["Desktop", "Tablet", "Mobile"],
                    show_in_home: true,
                    start_date: "",
                    end_date: "",
                    note: ""
                });
            }
        }
    }, [isOpen, banner]);

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
            setFormData(prev => ({ ...prev, image_url: res.data?.url || "" }));
            if (fieldErrors.image_url) setFieldErrors(prev => ({ ...prev, image_url: "" }));
            toast.success("Upload ảnh thành công!");
        } catch (error) {
            toast.error("Lỗi upload ảnh");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleDeviceChange = (device: string) => {
        setFormData(prev => {
            const newDevices = prev.devices.includes(device)
                ? prev.devices.filter(d => d !== device)
                : [...prev.devices, device];
            return { ...prev, devices: newDevices };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors: Record<string, string> = {};
        if (!formData.title.trim()) errors.title = "Vui lòng nhập tiêu đề banner";
        if (!formData.position) errors.position = "Vui lòng chọn vị trí hiển thị";
        if (formData.sort_order === undefined || formData.sort_order === null) errors.sort_order = "Vui lòng nhập thứ tự hiển thị";
        if (!formData.image_url) errors.image_url = "Vui lòng tải lên hình ảnh banner";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        
        setFieldErrors({});

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            };

            if (banner?.id) {
                await bannerService.updateBanner(banner.id, payload);
                toast.success("Cập nhật banner thành công!");
            } else {
                await bannerService.createBanner(payload);
                toast.success("Thêm banner mới thành công!");
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
                <div className="px-6 py-3 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-xl font-bold text-text-main">Thêm người dùng</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer">
                        <X size={20} />
                    </Button>
                </div>

                {/* Form */}
                <form id="banner-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-bg-secondary/20">
                    <div className="flex flex-col md:flex-row gap-6 px-6 py-4">
                        {/* Cột trái: Thông tin banner */}
                        <div className="flex-1 space-y-4">
                            <h4 className="font-medium text-text-main text-md mb-2">Thông tin banner</h4>

                            <div className="space-y-2">
                                <Label className="font-medium text-text-main">Tiêu đề <span className="text-error">*</span></Label>
                                <Input
                                    placeholder="Nhập tiêu đề banner..."
                                    value={formData.title}
                                    onChange={e => {
                                        setFormData({ ...formData, title: e.target.value });
                                        if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: "" });
                                    }}
                                    className={cn(fieldErrors.title && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.title && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.title}</p>}
                                <p className="text-xs text-text-secondary">Tiêu đề chỉ hiển thị trong quản trị</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-text-main">Vị trí hiển thị <span className="text-error">*</span></Label>
                                <Select
                                    value={formData.position}
                                    onValueChange={value => {
                                        setFormData({ ...formData, position: value });
                                        if (fieldErrors.position) setFieldErrors({ ...fieldErrors, position: "" });
                                    }}
                                >
                                    <SelectTrigger className={cn("w-full bg-bg-secondary h-[42px]", fieldErrors.position ? "border-error focus:ring-error" : "border-border-color")}>
                                        <SelectValue placeholder="Chọn vị trí hiển thị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HOME_TOP">Trang chủ - Top</SelectItem>
                                        <SelectItem value="HOME_MIDDLE">Trang chủ - Giữa</SelectItem>
                                        <SelectItem value="HOME_BOTTOM">Trang chủ - Dưới</SelectItem>
                                        <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.position && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.position}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-text-main">Liên kết</Label>
                                <Input
                                    placeholder="https://..."
                                    value={formData.link_url}
                                    onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                                />
                                <p className="text-xs text-text-secondary">Nhập URL liên kết khi click vào banner</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-text-main">Thứ tự hiển thị <span className="text-error">*</span></Label>
                                <Input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={e => {
                                        setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 });
                                        if (fieldErrors.sort_order) setFieldErrors({ ...fieldErrors, sort_order: "" });
                                    }}
                                    className={cn(fieldErrors.sort_order && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.sort_order && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.sort_order}</p>}
                                <p className="text-xs text-text-secondary">Số càng nhỏ, thứ tự hiển thị càng cao</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-text-main">Hình ảnh banner <span className="text-error">*</span></Label>
                                <div
                                    className={cn(
                                        "border-2 border-dashed bg-white rounded-lg flex flex-col items-center justify-center text-center hover:bg-bg-secondary/50 transition-colors relative group min-h-[160px] overflow-hidden",
                                        fieldErrors.image_url ? "border-error" : "border-border-color",
                                        isUploading && "opacity-50 cursor-wait"
                                    )}
                                >
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center z-30">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    )}
                                    {formData.image_url ? (
                                        <>
                                            <img
                                                src={formData.image_url}
                                                alt="Thumbnail preview"
                                                className="w-full h-full object-cover absolute inset-0"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                                                <span className="text-white font-bold text-sm flex items-center gap-2">
                                                    <RefreshCw size={16} /> Đổi ảnh khác
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setFormData({ ...formData, image_url: "" });
                                                }}
                                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 flex items-center justify-center z-20 cursor-pointer"
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
                                        onChange={handleUpload}
                                        disabled={isUploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                                        title=""
                                    />
                                </div>
                                {fieldErrors.image_url && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.image_url}</p>}
                                <p className="text-xs text-text-secondary">Định dạng: JPG, PNG, WEBP. Dung lượng tối đa 2MB.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-text-main">Mô tả</Label>
                                <textarea
                                    placeholder="Nhập mô tả banner (không bắt buộc)"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all text-text-main resize-none placeholder:text-text-secondary"
                                    rows={4}
                                    maxLength={300}
                                />
                            </div>
                        </div>

                        {/* Cột phải: Cài đặt hiển thị */}
                        <div className="w-full md:w-[400px] shrink-0 space-y-4">
                            <h4 className="font-medium text-text-main text-md mb-2">Cài đặt hiển thị</h4>

                            <div className="space-y-3">
                                <Label className="font-medium text-text-main">Trạng thái <span className="text-error">*</span></Label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.is_active}
                                            onChange={() => setFormData({ ...formData, is_active: true })}
                                            className="w-4 h-4 text-primary cursor-pointer accent-primary"
                                        />
                                        <span className="text-sm font-medium text-text-main select-none">Hiển thị</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!formData.is_active}
                                            onChange={() => setFormData({ ...formData, is_active: false })}
                                            className="w-4 h-4 text-primary cursor-pointer accent-primary"
                                        />
                                        <span className="text-sm font-medium text-text-main select-none">Ẩn</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="font-medium text-text-main">Thiết bị hiển thị</Label>
                                <div className="flex gap-4">
                                    {["Desktop", "Tablet", "Mobile"].map(device => (
                                        <label key={device} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.devices.includes(device)}
                                                onChange={() => handleDeviceChange(device)}
                                                className="w-4 h-4 text-primary rounded border-border-color focus:ring-primary/20 cursor-pointer accent-primary"
                                            />
                                            <span className="text-sm font-medium text-text-main select-none">{device}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-text-secondary">Chọn thiết bị sẽ hiển thị banner</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="font-medium text-text-main">Hiển thị trong trang chủ</Label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    {/* Simple native toggle using checkbox trick or just checkbox */}
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input
                                            type="checkbox"
                                            checked={formData.show_in_home}
                                            onChange={e => setFormData({ ...formData, show_in_home: e.target.checked })}
                                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                            style={{
                                                right: formData.show_in_home ? '0' : 'auto',
                                                borderColor: formData.show_in_home ? '#0d6efd' : '#e5e7eb',
                                                backgroundColor: 'white'
                                            }}
                                        />
                                        <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.show_in_home ? 'bg-blue-600' : 'bg-gray-300'}`}></label>
                                    </div>
                                    <span className="text-sm font-medium text-text-main select-none">Hiển thị ở trang chủ</span>
                                </label>
                            </div>

                            <div className="space-y-4 pt-2">
                                <Label className="font-medium text-text-main block">Thời gian hiển thị</Label>
                                <div className="space-y-2">
                                    <Label className="text-sm text-text-secondary">Từ ngày</Label>
                                    <DateTimePicker
                                        value={formData.start_date}
                                        onChange={date => setFormData({ ...formData, start_date: date ? date.toISOString() : "" })}
                                        placeholder="Chọn thời gian bắt đầu"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-text-secondary">Đến ngày</Label>
                                    <DateTimePicker
                                        value={formData.end_date}
                                        onChange={date => setFormData({ ...formData, end_date: date ? date.toISOString() : "" })}
                                        placeholder="Chọn thời gian kết thúc"
                                    />
                                </div>
                                <p className="text-xs text-text-secondary">Để trống nếu không giới hạn thời gian</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label className="font-medium text-text-main">Ghi chú</Label>
                                <textarea
                                    placeholder="Nhập ghi chú (không bắt buộc)"
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                    className="block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all text-text-main resize-none placeholder:text-text-secondary"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50 mt-auto shrink-0">
                    <Button variant="outline" onClick={onClose} className="font-medium px-5" disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button type="submit" form="banner-form" className="font-medium px-8 text-white gap-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu banner
                    </Button>
                </div>
            </div>
        </div>
    );
}
