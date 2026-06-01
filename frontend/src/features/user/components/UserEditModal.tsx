import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CalendarIcon } from "lucide-react";
import { toast } from "react-toastify";
import type { User } from "../types";
import { formatPrice } from "@/lib/utils";

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdated: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, user }) => {
  
    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual update logic when backend API is ready for all fields
        // Currently backend only supports updating role, status, and balance via separate APIs
        toast.info("Tính năng lưu toàn bộ thông tin đang được phát triển.");
        onClose();
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
                        {user.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-border-color" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                {user.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <Button type="button" variant="outline" className="w-fit border-primary text-primary hover:bg-primary/5">
                                <Upload className="mr-2 h-4 w-4" />
                                Thay đổi ảnh
                            </Button>
                            <span className="text-xs text-text-secondary">JPG, PNG, GIF. Tối đa 2MB</span>
                        </div>
                    </div>

                    {/* Row 1: ID, Username, Email */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-text-secondary">ID người dùng</Label>
                            <Input value={`#${user.id}`} disabled className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-text-main font-medium">Username <span className="text-error">*</span></Label>
                            <Input defaultValue={user.username} placeholder="Nhập username" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-text-main font-medium">Email <span className="text-error">*</span></Label>
                            <Input defaultValue={user.email} placeholder="Nhập email" type="email" />
                        </div>
                    </div>

                    {/* Row 2: Họ và tên, Số điện thoại */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-text-main font-medium">Họ và tên</Label>
                            <Input defaultValue={`${user.first_name || ''} ${user.last_name || ''}`.trim()} placeholder="Nhập họ và tên" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-text-main font-medium">Số điện thoại</Label>
                            <Input defaultValue={user.phone || ""} placeholder="Nhập số điện thoại" />
                        </div>
                    </div>

                    {/* Row 3: Vai trò, Trạng thái */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-text-main font-medium">Vai trò <span className="text-error">*</span></Label>
                            <Select defaultValue={user.role}>
                                <SelectTrigger className="w-full">
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
                        <div className="space-y-2">
                            <Label className="text-text-main font-medium">Trạng thái <span className="text-error">*</span></Label>
                            <Select defaultValue={user.status}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                    <SelectItem value="BANNED">Đã khóa</SelectItem>
                                    <SelectItem value="PENDING">Chờ xác thực</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 4: Số dư, Ngày đăng ký, Đăng nhập cuối */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-text-main font-medium">Số dư tài khoản</Label>
                            <div className="relative">
                                <Input defaultValue={formatPrice(Number(user.balance))} className="pr-8" disabled />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">đ</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-text-main font-medium">Ngày đăng ký</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                                <Input value={new Date(user.date_joined).toLocaleString("vi-VN", { dateStyle: 'short', timeStyle: 'short' })} disabled className="pl-9 bg-gray-50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-text-main font-medium">Đăng nhập cuối</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                                <Input value={user.last_login ? new Date(user.last_login).toLocaleString("vi-VN", { dateStyle: 'short', timeStyle: 'short' }) : "Chưa đăng nhập"} disabled className="pl-9 bg-gray-50" />
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Ghi chú */}
                    <div className="space-y-2">
                        <Label className="text-text-main font-medium">Ghi chú</Label>
                        <Textarea placeholder="Nhập ghi chú về người dùng..." className="min-h-[100px] resize-none" />
                    </div>

                </form>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button type="button" variant="outline" onClick={onClose} className="font-bold px-5">
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleSubmit} className="font-bold px-8">
                        <Save size={18} className="mr-2" />
                        Lưu thay đổi
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserEditModal;
