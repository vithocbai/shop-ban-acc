import React from "react";
import AccountList from "../../features/account/components/AccountList";

const AccountManagementPage: React.FC = () => {
    return (
        <div className="h-full flex flex-col p-6 pt-4 pb-0 space-y-4 max-w-full overflow-hidden">
            {/* Header / Breadcrumb area có thể đặt ở đây nếu cần */}
            <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-text-main">Quản lý Tài khoản</h1>
                <p className="text-sm text-text-secondary">
                    Thêm, sửa, xóa và quản lý danh sách tài khoản game trên hệ thống.
                </p>
            </div>

            {/* Nội dung chính */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-transparent">
                <AccountList />
            </div>
        </div>
    );
};

export default AccountManagementPage;
