import React, { useState } from "react";
import { X, Loader2, Info, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import type { User } from "../types";
import { cn } from "@/lib/utils";
import { userService } from "../services/user.service";

interface UserChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const UserChangePasswordModal: React.FC<UserChangePasswordModalProps> = ({ isOpen, onClose, user }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    if (!isOpen || !user) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const ROLE_MAP: Record<string, { label: string; color: string }> = {
        USER: { label: "Người dùng", color: "bg-blue-100 text-blue-700" },
        ADMIN: { label: "Admin", color: "bg-error/10 text-error" },
        MODERATOR: { label: "Moderator", color: "bg-orange-100 text-orange-700" },
        SUPER_ADMIN: { label: "Super Admin", color: "bg-purple-100 text-purple-700" },
    };

    const roleConf = ROLE_MAP[user.role] || { label: user.role, color: "bg-gray-200 text-black" };

    const checkPasswordStrength = (password: string) => {
        let score = 0;
        if (!password) return { score: 0, text: "Chưa nhập mật khẩu", color: "bg-gray-200" };
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (score === 0) return { score: 0, text: "Yếu", color: "bg-error" };
        if (score === 1) return { score: 1, text: "Yếu", color: "bg-error" };
        if (score === 2) return { score: 2, text: "Trung bình", color: "bg-orange-400" };
        if (score === 3) return { score: 3, text: "Khá", color: "bg-blue-400" };
        return { score: 4, text: "Mạnh", color: "bg-success" };
    };

    const strength = checkPasswordStrength(formData.newPassword);

    const checkRequirement = {
        length: formData.newPassword.length >= 8,
        case: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword),
        number: /\d/.test(formData.newPassword),
        special: /[^A-Za-z0-9]/.test(formData.newPassword)
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});

        const errors: Record<string, string> = {};
        if (!formData.currentPassword) errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
        if (!formData.newPassword) errors.newPassword = "Vui lòng nhập mật khẩu mới.";
        if (formData.newPassword && formData.newPassword.length < 8) errors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự.";
        if (!formData.confirmPassword) errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
        if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setIsLoading(false);
            return;
        }

        try {
            await userService.updateUserPassword({
                old_password: formData.currentPassword,
                new_password: formData.newPassword,
                confirm_password: formData.confirmPassword
            });
            toast.success("Đổi mật khẩu thành công!");
            onClose();
        } catch (err: any) {
            if (err.response?.status === 400 && typeof err.response?.data === "object") {
                const data = err.response.data;
                const parsedErrors: Record<string, string> = {};
                
                if (data.old_password) parsedErrors.currentPassword = Array.isArray(data.old_password) ? data.old_password.join(" ") : String(data.old_password);
                if (data.new_password) parsedErrors.newPassword = Array.isArray(data.new_password) ? data.new_password.join(" ") : String(data.new_password);
                if (data.confirm_password) parsedErrors.confirmPassword = Array.isArray(data.confirm_password) ? data.confirm_password.join(" ") : String(data.confirm_password);
                
                if (Object.keys(parsedErrors).length > 0) {
                    setFieldErrors(parsedErrors);
                    toast.error("Vui lòng kiểm tra lại thông tin đã nhập.");
                } else {
                    toast.error(data.message || data.detail || "Đổi mật khẩu thất bại.");
                }
            } else {
                toast.error(err.response?.data?.message || err.message || "Đổi mật khẩu thất bại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-main">Đổi mật khẩu</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer">
                        <X size={20} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        {user.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover border border-border-color" />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                                {user.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-text-main text-lg">{user.first_name || user.last_name ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : user.username}</span>
                            <div className="flex items-center gap-3">
                                <Badge className={cn("px-2 py-0.5 font-medium border-none", roleConf.color)}>{roleConf.label}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Mật khẩu hiện tại <span className="text-error">*</span></Label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <Input 
                                    name="currentPassword"
                                    type={showCurrentPassword ? "text" : "password"} 
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mật khẩu hiện tại" 
                                    className={cn("pl-10 pr-10", fieldErrors.currentPassword && "border-error focus-visible:ring-error")}
                                />
                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main cursor-pointer">
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.currentPassword && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.currentPassword}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Mật khẩu mới <span className="text-error">*</span></Label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <Input 
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"} 
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mật khẩu mới" 
                                    className={cn("pl-10 pr-10", fieldErrors.newPassword && "border-error focus-visible:ring-error")}
                                />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main cursor-pointer">
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.newPassword && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.newPassword}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-bold text-text-main">Xác nhận mật khẩu mới <span className="text-error">*</span></Label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <Input 
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"} 
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Nhập lại mật khẩu mới" 
                                    className={cn("pl-10 pr-10", fieldErrors.confirmPassword && "border-error focus-visible:ring-error")}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main cursor-pointer">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.confirmPassword}</p>}
                        </div>
                    </div>

                    {/* Password Strength */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-text-main">Độ mạnh mật khẩu:</span>
                            <span className="text-text-secondary">{strength.text}</span>
                        </div>
                        <div className="flex gap-1 h-1.5">
                            <div className={cn("flex-1 rounded-full", strength.score >= 1 ? strength.color : "bg-gray-200")}></div>
                            <div className={cn("flex-1 rounded-full", strength.score >= 2 ? strength.color : "bg-gray-200")}></div>
                            <div className={cn("flex-1 rounded-full", strength.score >= 3 ? strength.color : "bg-gray-200")}></div>
                            <div className={cn("flex-1 rounded-full", strength.score >= 4 ? strength.color : "bg-gray-200")}></div>
                        </div>
                    </div>

                    <hr className="border-border-color" />

                    {/* Password Requirements */}
                    {/* <div className="space-y-3">
                        <Label className="font-bold text-text-main block">Yêu cầu mật khẩu:</Label>
                        <div className="space-y-2 text-sm">
                            <div className={cn("flex items-center gap-2", checkRequirement.length ? "text-success" : "text-text-secondary")}>
                                <CheckCircle2 size={16} /> Ít nhất 8 ký tự
                            </div>
                            <div className={cn("flex items-center gap-2", checkRequirement.case ? "text-success" : "text-text-secondary")}>
                                <CheckCircle2 size={16} /> Có chữ hoa và chữ thường
                            </div>
                            <div className={cn("flex items-center gap-2", checkRequirement.number ? "text-success" : "text-text-secondary")}>
                                <CheckCircle2 size={16} /> Có số
                            </div>
                            <div className={cn("flex items-center gap-2", checkRequirement.special ? "text-success" : "text-text-secondary")}>
                                <CheckCircle2 size={16} /> Có ký tự đặc biệt
                            </div>
                        </div>
                    </div> */}
                </form>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button type="button" variant="outline" onClick={onClose} className="font-bold px-5 bg-white">
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="font-bold px-8 bg-primary hover:bg-primary/90 text-white">
                        {isLoading ? <Loader2 className="mr-2 animate-spin" size={18} /> : "Cập nhật mật khẩu"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserChangePasswordModal;
