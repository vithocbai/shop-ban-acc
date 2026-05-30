import React from "react";
import UserList from "@/features/user/components/UserList";
import { Users } from "lucide-react";

const UserManagement: React.FC = () => {
    return (
        <div className="h-full flex flex-col min-h-0 space-y-2">
            <div className="flex items-center gap-3 shrink-0 pb-2 border-b border-border-color">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Users size={24} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-main leading-tight">Quản lý Người dùng</h1>
                    <p className="text-sm text-text-secondary mt-1">Theo dõi, kiểm tra và quản lý thông tin tài khoản người dùng, phân quyền hệ thống.</p>
                </div>
            </div>
            <UserList />
        </div>
    );
};

export default UserManagement;
