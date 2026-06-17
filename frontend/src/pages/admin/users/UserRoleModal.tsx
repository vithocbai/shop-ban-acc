import React, { useState, useEffect } from "react";
import { X, Loader2, Info, ChevronDown, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { userService } from "@/features/user/services/user.service";
import type { User } from "@/features/user/types";

interface UserRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdated: () => void;
}

const PERMISSION_GROUPS = [
    {
        id: "manage_account",
        label: "Quản lý tài khoản",
        permissions: [
            { id: "view_accounts", label: "Xem danh sách tài khoản" },
            { id: "add_account", label: "Thêm tài khoản" },
            { id: "edit_account", label: "Chỉnh sửa tài khoản" },
            { id: "delete_account", label: "Xóa tài khoản" },
        ]
    },
    {
        id: "manage_order",
        label: "Quản lý đơn hàng",
        permissions: [
            { id: "view_orders", label: "Xem đơn hàng" },
            { id: "update_order_status", label: "Cập nhật trạng thái" },
            { id: "cancel_order", label: "Hủy đơn hàng" },
            { id: "refund_order", label: "Hoàn tiền" },
        ]
    },
    {
        id: "manage_game",
        label: "Quản lý game",
        permissions: [
            { id: "view_games", label: "Xem danh sách game" },
            { id: "add_game", label: "Thêm game" },
            { id: "edit_game", label: "Chỉnh sửa game" },
            { id: "delete_game", label: "Xóa game" },
        ]
    }
];

const UserRoleModal: React.FC<UserRoleModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<string>("USER");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        manage_account: true,
        manage_order: true,
        manage_game: true
    });

    useEffect(() => {
        if (isOpen && user) {
            setRole(user.role || "USER");
            // Mock pre-selected permissions based on role
            if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
                setSelectedPermissions(["view_accounts", "add_account", "edit_account", "view_orders", "update_order_status", "view_games", "add_game", "edit_game"]);
            } else if (user.role === "MODERATOR") {
                setSelectedPermissions(["view_accounts", "view_orders", "view_games"]);
            } else {
                setSelectedPermissions([]);
            }
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const ROLE_MAP: Record<string, { label: string; color: string }> = {
        USER: { label: "Người dùng", color: "bg-blue-100 text-blue-700" },
        ADMIN: { label: "Admin", color: "bg-error/10 text-error" },
        MODERATOR: { label: "Moderator", color: "bg-orange-100 text-orange-700" },
        SUPER_ADMIN: { label: "Super Admin", color: "bg-purple-100 text-purple-700" },
    };

    const roleConf = ROLE_MAP[user.role] || { label: user.role, color: "bg-gray-200 text-black" };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    const handleSelectAll = () => {
        const allIds = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.id));
        setSelectedPermissions(allIds);
    };

    const handleDeselectAll = () => {
        setSelectedPermissions([]);
    };

    const handlePermissionToggle = (permId: string) => {
        setSelectedPermissions(prev => 
            prev.includes(permId) 
                ? prev.filter(id => id !== permId)
                : [...prev, permId]
        );
    };

    const handleGroupToggle = (groupId: string) => {
        const group = PERMISSION_GROUPS.find(g => g.id === groupId);
        if (!group) return;

        const groupPermIds = group.permissions.map(p => p.id);
        const isAllSelected = groupPermIds.every(id => selectedPermissions.includes(id));

        if (isAllSelected) {
            setSelectedPermissions(prev => prev.filter(id => !groupPermIds.includes(id)));
        } else {
            setSelectedPermissions(prev => {
                const newSet = new Set([...prev, ...groupPermIds]);
                return Array.from(newSet);
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await userService.updateUserRole(user.id, role);
            // Note: Backend API for updating granular permissions does not exist yet.
            // We just update the Role for now.
            toast.success("Cập nhật phân quyền thành công!");
            onUserUpdated();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Cập nhật quyền thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-main">Phân quyền người dùng</h3>
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
                                <span className="text-sm text-text-secondary">ID: #{user.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Role Select */}
                    <div className="space-y-2">
                        <Label className="font-bold text-text-main">Vai trò <span className="text-error">*</span></Label>
                        <Select value={role} onValueChange={setRole}>
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
                        <p className="text-sm text-text-secondary">Vai trò xác định quyền hạn tổng quát của người dùng trong hệ thống.</p>
                    </div>

                    {/* Permissions List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="font-bold text-text-main text-base">Quyền hạn</Label>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-text-secondary">Chọn nhanh:</span>
                                <button type="button" onClick={handleSelectAll} className="text-primary hover:underline font-medium cursor-pointer">Chọn tất cả</button>
                                <button type="button" onClick={handleDeselectAll} className="text-primary hover:underline font-medium cursor-pointer">Bỏ chọn tất cả</button>
                            </div>
                        </div>

                        <div className="border border-border-color rounded-md bg-white overflow-hidden">
                            <div className="max-h-[250px] overflow-y-auto p-2">
                                {PERMISSION_GROUPS.map((group) => {
                                    const groupPermIds = group.permissions.map(p => p.id);
                                    const isAllSelected = groupPermIds.every(id => selectedPermissions.includes(id));
                                    const isSomeSelected = groupPermIds.some(id => selectedPermissions.includes(id));
                                    const isExpanded = expandedGroups[group.id];

                                    return (
                                        <div key={group.id} className="mb-2 last:mb-0">
                                            {/* Group Header */}
                                            <div className="flex items-center gap-2 p-2 hover:bg-bg-secondary rounded-md cursor-pointer group">
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => { e.stopPropagation(); toggleGroup(group.id); }}
                                                    className="p-1 rounded-sm hover:bg-gray-200 text-text-secondary"
                                                >
                                                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                                                </button>
                                                
                                                <div 
                                                    className={cn(
                                                        "w-5 h-5 rounded-sm border flex items-center justify-center cursor-pointer",
                                                        isAllSelected ? "bg-primary border-primary text-white" : "border-gray-300 bg-white"
                                                    )}
                                                    onClick={(e) => { e.stopPropagation(); handleGroupToggle(group.id); }}
                                                >
                                                    {isAllSelected && <Check size={12} strokeWidth={3} />}
                                                    {!isAllSelected && isSomeSelected && <div className="w-2 h-2 bg-primary rounded-sm" />}
                                                </div>
                                                
                                                <span 
                                                    className="font-medium text-sm text-text-main select-none flex-1"
                                                    onClick={(e) => { e.stopPropagation(); handleGroupToggle(group.id); }}
                                                >
                                                    {group.label}
                                                </span>
                                            </div>

                                            {/* Group Items */}
                                            {isExpanded && (
                                                <div className="pl-16 space-y-2 mt-1 mb-3">
                                                    {group.permissions.map(perm => {
                                                        const isSelected = selectedPermissions.includes(perm.id);
                                                        return (
                                                            <div key={perm.id} className="flex items-center gap-3">
                                                                <div 
                                                                    className={cn(
                                                                        "w-5 h-5 rounded-sm border flex items-center justify-center cursor-pointer",
                                                                        isSelected ? "bg-primary border-primary text-white" : "border-gray-300 bg-white"
                                                                    )}
                                                                    onClick={() => handlePermissionToggle(perm.id)}
                                                                >
                                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                                </div>
                                                                <Label 
                                                                    className="text-sm font-normal text-text-main cursor-pointer select-none"
                                                                    onClick={() => handlePermissionToggle(perm.id)}
                                                                >
                                                                    {perm.label}
                                                                </Label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button type="button" variant="outline" onClick={onClose} className="font-bold px-5 bg-white">
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="font-bold px-8 bg-primary hover:bg-primary/90 text-white">
                        {isLoading ? <Loader2 className="mr-2 animate-spin" size={18} /> : "Lưu phân quyền"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserRoleModal;
