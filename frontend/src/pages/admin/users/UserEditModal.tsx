import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Upload, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { formatPrice, cn } from "@/lib/utils";
import api from "@/services/api";
import type { User } from "@/features/user/types";
import { userService } from "@/features/user/services/user.service";

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdated: () => void;
}

interface UserFormState {
    username: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    status: string;
    avatar: string;
    note: string;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<UserFormState>({
        username: "",
        email: "",
        fullName: "",
        phone: "",
        role: "USER",
        status: "ACTIVE",
        avatar: "",
        note: ""
    });

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
                phone: user.phone || "",
                role: user.role || "USER",
                status: user.status || "ACTIVE",
                avatar: user.avatar || "",
                note: ""
            });
            setFieldErrors({});
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        if (fieldErrors.avatar) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.avatar;
                return next;
            });
        }

        try {
            const inputFormData = new FormData();
            inputFormData.append("file", file);

            const response = await api.post("/upload/", inputFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            const fileUrl = response.data?.url;
            setFormData((prev) => ({ ...prev, avatar: fileUrl }));
            toast.success("Tải ảnh lên thành công!");
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Lỗi tải ảnh lên.";
            setFieldErrors((prev) => ({ ...prev, avatar: errorMsg }));
            toast.error(`Không thể upload ảnh: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});

        // Validation cơ bản
        const errors: Record<string, string> = {};
        if (!formData.username.trim()) errors.username = "Username là bắt buộc.";
        if (!formData.email.trim()) errors.email = "Email là bắt buộc.";
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setIsLoading(false);
            return;
        }

        const parts = formData.fullName.trim().split(" ");
        const first_name = parts[0] || "";
        const last_name = parts.slice(1).join(" ") || "";

        const payload: Partial<User> = {
            username: formData.username,
            email: formData.email,
            first_name,
            last_name,
            phone: formData.phone,
            role: formData.role as any,
            status: formData.status as any,
            avatar: formData.avatar,
        };

        try {
            await userService.updateUser(user.id, payload);
            toast.success("Cập nhật thông tin người dùng thành công!");
            onUserUpdated();
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
                toast.error(err.response?.data?.message || err.message || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-main">Chỉnh sửa người dùng</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer"
                    >
                        <X size={20} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-border-color" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                {formData.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                        )}
                        <div className="flex flex-col gap-2 relative">
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <label htmlFor="avatar-upload" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-10 px-4 py-2 w-fit border-primary text-primary hover:bg-primary/5 cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Thay đổi ảnh
                            </label>
                            <span className="text-xs text-text-secondary">JPG, PNG, GIF. Tối đa 2MB</span>
                            {fieldErrors.avatar && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.avatar}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 1: ID, Username, Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-text-main">Tên đăng nhập <span className="text-error">*</span></Label>
                            <Input 
                                name="username"
                                value={formData.username} 
                                onChange={handleInputChange}
                                placeholder="Nhập tên đăng nhập" 
                                className={cn(fieldErrors.username && "border-error focus-visible:ring-error")}
                            />
                            {fieldErrors.username && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.username}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-text-main">Email <span className="text-error">*</span></Label>
                            <Input 
                                name="email"
                                value={formData.email} 
                                onChange={handleInputChange}
                                placeholder="Nhập email" 
                                type="email" 
                                className={cn(fieldErrors.email && "border-error focus-visible:ring-error")}
                            />
                            {fieldErrors.email && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Họ và tên, Số điện thoại */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-text-main">Họ và tên</Label>
                            <Input 
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Nhập họ và tên" 
                                className={cn(fieldErrors.first_name || fieldErrors.last_name ? "border-error focus-visible:ring-error" : "")}
                            />
                            {(fieldErrors.first_name || fieldErrors.last_name) && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.first_name || fieldErrors.last_name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-text-main">Số điện thoại</Label>
                            <Input 
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Nhập số điện thoại" 
                                className={cn(fieldErrors.phone && "border-error focus-visible:ring-error")}
                            />
                            {fieldErrors.phone && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Vai trò, Trạng thái */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-text-main">Vai trò <span className="text-error">*</span></Label>
                            <Select value={formData.role} onValueChange={(val) => handleSelectChange("role", val)}>
                                <SelectTrigger className={cn("w-full", fieldErrors.role && "border-error focus-visible:ring-error")}>
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">Người dùng</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldErrors.role && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.role}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-text-main">Trạng thái <span className="text-error">*</span></Label>
                            <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)}>
                                <SelectTrigger className={cn("w-full", fieldErrors.status && "border-error focus-visible:ring-error")}>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                    <SelectItem value="BANNED">Đã khóa</SelectItem>
                                    <SelectItem value="PENDING">Chờ xác thực</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldErrors.status && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.status}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 4: Số dư, Ngày đăng ký, Đăng nhập cuối */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-text-main">Số dư tài khoản</Label>
                            <div className="relative">
                                <Input value={formatPrice(Number(user.balance))} className="pr-8 bg-gray-50" disabled />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">đ</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-text-main">Ngày đăng ký</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                                <Input value={new Date(user.date_joined).toLocaleString("vi-VN", { dateStyle: 'short', timeStyle: 'short' })} disabled className="pl-9 bg-gray-50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-text-main">Đăng nhập cuối</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                                <Input value={user.last_login ? new Date(user.last_login).toLocaleString("vi-VN", { dateStyle: 'short', timeStyle: 'short' }) : "Chưa đăng nhập"} disabled className="pl-9 bg-gray-50" />
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Ghi chú */}
                    <div className="space-y-2">
                        <Label className="font-bold text-text-main">Ghi chú</Label>
                        <Textarea 
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Nhập ghi chú về người dùng..." 
                            className="block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all text-text-main min-h-[100px] resize-none placeholder:text-text-secondary" 
                        />
                    </div>

                </form>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button type="button" variant="outline" onClick={onClose} className="font-bold px-5">
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="font-bold px-8">
                        {isLoading ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save size={18} className="mr-2" />}
                        Lưu thay đổi
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserEditModal;
