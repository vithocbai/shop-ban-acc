import React, { useState } from "react";
import { X, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { userService } from "@/features/user/services/user.service";


interface UserCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({ isOpen, onClose, onUserCreated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        fullName: "",
        phone: "",
        password: "",
        role: "USER",
        status: "ACTIVE",
        balance: "0",
        note: ""
    });

    if (!isOpen) return null;

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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});

        // Validate
        const errors: Record<string, string> = {};
        if (!formData.username) errors.username = "Vui lòng tên đăng nhập.";
        if (!formData.email) errors.email = "Vui lòng nhập email.";
        if (!formData.fullName) errors.fullName = "Vui lòng nhập họ và tên.";
        if (!formData.password) errors.password = "Vui lòng nhập mật khẩu.";
        else if (formData.password.length < 8) errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setIsLoading(false);
            return;
        }

        const nameParts = formData.fullName.trim().split(" ");
        const first_name = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0];
        const last_name = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        const submitData = {
            username: formData.username,
            email: formData.email,
            first_name,
            last_name,
            phone: formData.phone,
            password: formData.password,
            role: formData.role,
            status: formData.status,
            balance: parseFloat(formData.balance.replace(/[^0-9.-]+/g, "")) || 0
        };

        try {
            await userService.createUser(submitData);
            toast.success("Thêm người dùng mới thành công!");
            onUserCreated();
            onClose();
        } catch (err: any) {
            if (err.response?.status === 400 && typeof err.response?.data === "object") {
                const data = err.response.data;
                const parsedErrors: Record<string, string> = {};
                if (data.email) parsedErrors.email = Array.isArray(data.email) ? data.email.join(" ") : String(data.email);
                if (data.username) parsedErrors.username = Array.isArray(data.username) ? data.username.join(" ") : String(data.username);
                if (data.password) parsedErrors.password = Array.isArray(data.password) ? data.password.join(" ") : String(data.password);

                if (Object.keys(parsedErrors).length > 0) {
                    setFieldErrors(parsedErrors);
                    toast.error("Vui lòng kiểm tra lại thông tin đã nhập.");
                } else {
                    toast.error(data.message || data.detail || "Thêm người dùng thất bại.");
                }
            } else {
                toast.error(err.response?.data?.message || err.message || "Thêm người dùng thất bại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-xl font-bold text-text-main">Thêm người dùng</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer">
                        <X size={20} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 px-6 space-y-6">

                    {/* Section: Thông tin tài khoản */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-text-main text-base">Thông tin tài khoản</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-1.5">
                                <Label className="font-medium text-text-main">Tên đăng nhập</Label>
                                <Input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên đăng nhập"
                                    className={cn(fieldErrors.username && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.username && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.username}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-medium text-text-main">Email <span className="text-error">*</span></Label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Nhập email"
                                    className={cn(fieldErrors.email && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.email && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.email}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-medium text-text-main">Họ và tên <span className="text-error">*</span></Label>
                                <Input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Nhập họ và tên"
                                    className={cn(fieldErrors.fullName && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.fullName && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.fullName}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-medium text-text-main">Số điện thoại</Label>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-medium text-text-main">Mật khẩu <span className="text-error">*</span></Label>
                                <div className="relative">
                                    <Input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mật khẩu"
                                        className={cn("pr-10", fieldErrors.password && "border-error focus-visible:ring-error")}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main cursor-pointer">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {fieldErrors.password && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.password}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section: Thông tin phân quyền */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-text-main text-base">Thông tin phân quyền</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-1.5">
                                <Label className="font-medium text-text-main">Vai trò <span className="text-error">*</span></Label>
                                <Select value={formData.role} onValueChange={(val) => handleSelectChange('role', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">Người dùng</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="MODERATOR">Moderator</SelectItem>
                                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-medium text-text-main">Trạng thái <span className="text-error">*</span></Label>
                                <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                        <SelectItem value="BANNED">Đã bị khóa</SelectItem>
                                        <SelectItem value="PENDING">Chờ xác thực</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Thông tin khác */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-text-main text-base">Thông tin khác</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-1.5">
                                <Label className="font-medium text-text-main">Số dư tài khoản</Label>
                                <div className="relative">
                                    <Input
                                        name="balance"
                                        type="number"
                                        value={formData.balance}
                                        onChange={handleInputChange}
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">đ</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-medium text-text-main">Ghi chú</Label>
                                <div className="relative">
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleInputChange}
                                        placeholder="Nhập ghi chú (nếu có)..."
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                                        maxLength={255}
                                    />
                                    <div className="absolute bottom-2 right-2 text-[10px] text-text-secondary">
                                        {formData.note.length}/255
                                    </div>
                                </div>
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
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Thêm người dùng"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserCreateModal;
