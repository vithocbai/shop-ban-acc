import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '@/services/api';
import { authService } from '../../services/auth.service';

interface PersonalInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PersonalInfoModal: React.FC<PersonalInfoModalProps> = ({ isOpen, onClose }) => {
    const { user, fetchUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        avatar: '',
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: (user as any).phone || '',
                avatar: user.avatar || '',
            });
            setFieldErrors({}); // Reset lỗi theo quy tắc
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

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

    const handleSave = async () => {
        const errors: Record<string, string> = {};
        if (!formData.first_name.trim()) {
            errors.first_name = "Vui lòng nhập tên";
        }
        if (!formData.last_name.trim()) {
            errors.last_name = "Vui lòng nhập họ";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                phone: formData.phone.trim(),
                avatar: formData.avatar,
            };
            
            await authService.updateMe(payload);
            await fetchUser(); // Làm mới lại Context để cập nhật ảnh trên header
            toast.success("Đã lưu thông tin cá nhân!");
            onClose();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h2 className="text-lg font-medium text-text-main">Thông tin cá nhân</h2>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer" onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row gap-6 px-6 py-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex-1 space-y-4">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 mb-2">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-border-color" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    {user?.username?.charAt(0).toUpperCase() || "?"}
                                </div>
                            )}
                            <div className="flex flex-col gap-2 relative">
                                <input
                                    type="file"
                                    id="personal-avatar-upload"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <label htmlFor="personal-avatar-upload" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-10 px-4 py-2 w-fit border-primary text-primary hover:bg-primary/5 cursor-pointer">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Thay đổi ảnh
                                </label>
                                <span className="text-xs text-text-secondary">JPG, PNG, GIF. Tối đa 2MB</span>
                                {fieldErrors.avatar && (
                                    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.avatar}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="username" className="font-medium text-text-main">Tên đăng nhập</Label>
                                <Input id="username" value={user?.username || ''} disabled className="bg-bg-secondary border-border-color" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="role" className="font-medium text-text-main">Vai trò</Label>
                                <Input id="role" value={user?.role || ''} disabled className="bg-bg-secondary border-border-color" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="email" className="font-medium text-text-main">Email</Label>
                                <Input id="email" value={user?.email || ''} disabled className="bg-bg-secondary border-border-color" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone" className="font-medium text-text-main">Số điện thoại</Label>
                                <Input 
                                    id="phone" 
                                    value={formData.phone} 
                                    onChange={(e) => {
                                        setFormData({ ...formData, phone: e.target.value });
                                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
                                    }}
                                    className={cn(fieldErrors.phone && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.phone && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.phone}</p>}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="last_name" className="font-medium text-text-main">Họ <span className="text-error">*</span></Label>
                                <Input 
                                    id="last_name" 
                                    value={formData.last_name} 
                                    onChange={(e) => {
                                        setFormData({ ...formData, last_name: e.target.value });
                                        if (fieldErrors.last_name) setFieldErrors({ ...fieldErrors, last_name: "" });
                                    }}
                                    className={cn(fieldErrors.last_name && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.last_name && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.last_name}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="first_name" className="font-medium text-text-main">Tên <span className="text-error">*</span></Label>
                            <Input 
                                    id="first_name" 
                                    value={formData.first_name} 
                                    onChange={(e) => {
                                        setFormData({ ...formData, first_name: e.target.value });
                                        if (fieldErrors.first_name) setFieldErrors({ ...fieldErrors, first_name: "" });
                                    }}
                                    className={cn(fieldErrors.first_name && "border-error focus-visible:ring-error")}
                                />
                                {fieldErrors.first_name && <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.first_name}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button variant="outline" className="font-medium px-5" onClick={onClose}>Hủy</Button>
                    <Button className="font-medium px-8" onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoModal;
