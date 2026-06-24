import React, { useState, useEffect } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { authService } from "../../services/auth.service";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                old_password: "",
                new_password: "",
                confirm_password: "",
            });
            setFieldErrors({}); // Reset lỗi theo quy tắc
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (fieldErrors[id]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    };

    const handleSave = async () => {
        const errors: Record<string, string> = {};

        if (!formData.old_password) {
            errors.old_password = "Vui lòng nhập mật khẩu cũ";
        }
        if (!formData.new_password) {
            errors.new_password = "Vui lòng nhập mật khẩu mới";
        } else if (formData.new_password.length < 8) {
            errors.new_password = "Mật khẩu mới phải có ít nhất 8 ký tự";
        }
        if (!formData.confirm_password) {
            errors.confirm_password = "Vui lòng xác nhận mật khẩu mới";
        } else if (formData.new_password !== formData.confirm_password) {
            errors.confirm_password = "Mật khẩu xác nhận không khớp";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            await authService.changePassword({
                old_password: formData.old_password,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password,
            });

            toast.success("Đổi mật khẩu thành công!");
            onClose();
        } catch (error: any) {
            // Xử lý lỗi từ API trả về (ví dụ API trả về {"old_password": ["Mật khẩu cũ không chính xác."]})
            if (error.response?.data && typeof error.response.data === "object") {
                const data = error.response.data;
                const newErrors: Record<string, string> = {};
                Object.keys(data).forEach((key) => {
                    const val = data[key];
                    if (Array.isArray(val)) {
                        newErrors[key] = val.join(" ");
                    } else if (typeof val === "string") {
                        newErrors[key] = val;
                    }
                });

                if (Object.keys(newErrors).length > 0) {
                    setFieldErrors(newErrors);
                } else {
                    toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
                }
            } else {
                toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="bg-white rounded-md shadow-2xl w-full min-h-[60vh] max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h2 className="text-lg font-medium text-text-main">Đổi mật khẩu</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row gap-6 px-6 py-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="old_password" className="font-medium text-text-main w-full">
                                Mật khẩu cũ <span className="text-error">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="old_password"
                                    type={showOldPassword ? "text" : "password"}
                                    value={formData.old_password}
                                    onChange={handleChange}
                                    className={cn(fieldErrors.old_password && "border-error focus-visible:ring-error")}
                                />
                                <span
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute bottom-[50%] translate-y-1/2 right-3 cursor-pointer"
                                >
                                    {showOldPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </span>
                            </div>
                            {fieldErrors.old_password && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.old_password}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="new_password" className="font-medium text-text-main">
                                Mật khẩu mới <span className="text-error">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="new_password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    className={cn(fieldErrors.new_password && "border-error focus-visible:ring-error")}
                                />
                                <span
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute bottom-[50%] translate-y-1/2 right-3 cursor-pointer"
                                >
                                    {showNewPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </span>
                            </div>
                            {fieldErrors.new_password && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.new_password}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="confirm_password" className="font-medium text-text-main">
                                Xác nhận mật khẩu mới <span className="text-error">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirm_password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className={cn(
                                        fieldErrors.confirm_password && "border-error focus-visible:ring-error",
                                    )}
                                />
                                <span
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute bottom-[50%] translate-y-1/2 right-3 cursor-pointer"
                                >
                                    {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </span>
                            </div>
                            {fieldErrors.confirm_password && (
                                <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.confirm_password}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button variant="outline" className="font-medium px-5" onClick={onClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button className="font-medium px-8" onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
