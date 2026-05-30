import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { Loader2, AlertTriangle } from "lucide-react";
import type { User } from "../types";
import { userService } from "../services/user.service";
import { formatPrice } from "@/lib/utils";

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUserUpdated: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    // States for balance update
    const [balanceAmount, setBalanceAmount] = useState<string>("");
    const [balanceReason, setBalanceReason] = useState<string>("");

    const handleRoleChange = async (newRole: string) => {
        try {
            setIsLoading(true);
            await userService.updateUserRole(user.id, newRole);
            toast.success("Cập nhật quyền thành công");
            onUserUpdated();
        } catch (error: any) {
            toast.error(error.message || "Cập nhật quyền thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            setIsLoading(true);
            await userService.updateUserStatus(user.id, newStatus);
            toast.success("Cập nhật trạng thái thành công");
            onUserUpdated();
        } catch (error: any) {
            toast.error(error.message || "Cập nhật trạng thái thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBalanceUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!balanceAmount || !balanceReason) {
            toast.error("Vui lòng nhập số tiền và lý do");
            return;
        }

        const amountNum = Number(balanceAmount);
        if (isNaN(amountNum) || amountNum === 0) {
            toast.error("Số tiền không hợp lệ");
            return;
        }

        try {
            setIsLoading(true);
            await userService.updateUserBalance(user.id, amountNum, balanceReason);
            toast.success(`Đã ${amountNum > 0 ? "cộng" : "trừ"} tiền thành công`);
            setBalanceAmount("");
            setBalanceReason("");
            onUserUpdated();
        } catch (error: any) {
            toast.error(error.message || "Cập nhật số dư thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-border-color shrink-0 bg-bg-secondary">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        {user.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-border-color" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                                {user.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <span>{user.username} <span className="text-text-secondary text-sm font-normal">#{user.id}</span></span>
                            <span className="text-sm font-normal text-text-secondary">{user.email}</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="mb-6 grid w-full grid-cols-3">
                            <TabsTrigger value="general">Thông tin & Cài đặt</TabsTrigger>
                            <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
                            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-8">
                            
                            {/* Phân quyền và Trạng thái */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-text-secondary font-bold">Quyền hạn (Role)</Label>
                                    <Select 
                                        defaultValue={user.role} 
                                        onValueChange={handleRoleChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full h-11 border-border-color">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER">Người dùng</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="MODERATOR">Moderator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-text-secondary font-bold">Trạng thái Tài khoản</Label>
                                    <Select 
                                        defaultValue={user.status} 
                                        onValueChange={handleStatusChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className={`w-full h-11 border-border-color ${user.status === 'BANNED' ? 'text-error font-bold' : ''}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                            <SelectItem value="BANNED">Khóa (Banned)</SelectItem>
                                            <SelectItem value="PENDING">Chờ xác thực</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <hr className="border-border-color" />

                            {/* Quản lý Số dư */}
                            <section>
                                <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                    Quản lý Số dư
                                    <span className="text-success text-xl ml-auto">{formatPrice(Number(user.balance))}</span>
                                </h3>
                                
                                <form onSubmit={handleBalanceUpdate} className="bg-bg-secondary p-5 rounded-lg border border-border-color space-y-4">
                                    <div className="flex items-start gap-2 mb-2 text-sm text-warning font-medium bg-warning/10 p-3 rounded-md">
                                        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                        <p>Thao tác thay đổi số dư sẽ được ghi lại trong lịch sử biến động số dư của người dùng.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Số tiền thay đổi (+/-)</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="VD: 50000 (cộng) hoặc -50000 (trừ)"
                                                value={balanceAmount}
                                                onChange={(e) => setBalanceAmount(e.target.value)}
                                                className="h-11"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lý do thay đổi</Label>
                                            <Input 
                                                placeholder="VD: Nạp tiền lỗi, Hoàn tiền..."
                                                value={balanceReason}
                                                onChange={(e) => setBalanceReason(e.target.value)}
                                                className="h-11"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        className="w-full sm:w-auto mt-2 font-bold cursor-pointer"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Thực hiện thay đổi số dư
                                    </Button>
                                </form>
                            </section>

                            {/* Thông tin thêm */}
                            <section>
                                <h3 className="text-sm font-bold text-text-secondary uppercase mb-3">Thông tin hệ thống</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <div className="text-text-secondary">Xác thực Email:</div>
                                    <div className="font-medium text-text-main">{user.email_verified ? "Đã xác thực" : "Chưa xác thực"}</div>
                                    
                                    <div className="text-text-secondary">Ngày tham gia:</div>
                                    <div className="font-medium text-text-main">{new Date(user.date_joined || user.created_at).toLocaleString("vi-VN")}</div>
                                    
                                    <div className="text-text-secondary">Cập nhật lần cuối:</div>
                                    <div className="font-medium text-text-main">{new Date(user.updated_at).toLocaleString("vi-VN")}</div>
                                </div>
                            </section>
                        </TabsContent>

                        <TabsContent value="transactions" className="pt-4">
                            <div className="flex flex-col items-center justify-center h-48 text-text-secondary bg-bg-secondary rounded-lg border border-dashed border-border-color">
                                <p>Tính năng Lịch sử giao dịch đang được cập nhật...</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="orders" className="pt-4">
                            <div className="flex flex-col items-center justify-center h-48 text-text-secondary bg-bg-secondary rounded-lg border border-dashed border-border-color">
                                <p>Tính năng Lịch sử đơn hàng đang được cập nhật...</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailModal;
