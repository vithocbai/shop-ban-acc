import React, { useEffect, useState, useCallback } from "react";
import { userService } from "@/features/user/services/user.service";
import type { User, UserFilters } from "@/features/user/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Edit, Trash2, Plus, KeyRound, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { toast } from "react-toastify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import UserEditModal from "./UserEditModal";
import UserChangePasswordModal from "./UserChangePasswordModal";
import UserRoleModal from "./UserRoleModal";
import UserCreateModal from "./UserCreateModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "success";

const ROLE_MAP: Record<string, { label: string; variant: BadgeVariant; className?: string }> = {
    USER: { label: "Người dùng", variant: "secondary" },
    ADMIN: { label: "Quản trị viên", variant: "secondary" },
    SUPER_ADMIN: { label: "Super Admin", variant: "secondary", className: "bg-purple-600 hover:bg-purple-700 text-white" },
    MODERATOR: { label: "Moderator", variant: "outline" },
};

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
    ACTIVE: { label: "Hoạt động", variant: "success" },
    BANNED: { label: "Bị khóa", variant: "destructive" },
    PENDING: { label: "Chờ xác thực", variant: "secondary" },
};

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Modal
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on search change
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const filters: UserFilters = {
                page,
                page_size: pageSize,
                search: debouncedSearch,
                role: roleFilter !== "ALL" ? roleFilter : undefined,
                status: statusFilter !== "ALL" ? statusFilter : undefined,
            };

            const data = await userService.getUsers(filters);
            setUsers(data.items || []);
            setTotal(data.total || 0);
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi tải danh sách người dùng");
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, debouncedSearch, roleFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleChangePassword = (user: User) => {
        setSelectedUser(user);
        setIsChangePasswordModalOpen(true);
    };

    const handleAssignRole = (user: User) => {
        setSelectedUser(user);
        setIsRoleModalOpen(true);
    };

    const handleDeleteUserConfirm = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const executeDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await userService.deleteUser(selectedUser.id);
            toast.success(`Đã xóa tài khoản ${selectedUser.username} thành công`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || "Xóa tài khoản thất bại");
            throw error; // Let the modal handle the loading state
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 gap-2 space-y-4">
            {/* Thanh công cụ tìm kiếm và lọc */}
            <div className="pb-2 px-[1px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-0">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary z-10">
                            <Search size={18} />
                        </div>
                        <Input
                            placeholder="Tìm kiếm tên đăng nhập hoặc email..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select
                        value={roleFilter}
                        onValueChange={(val) => {
                            setRoleFilter(val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Tất cả quyền" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả quyền</SelectItem>
                            <SelectItem value="USER">Người dùng</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MODERATOR">Moderator</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusFilter}
                        onValueChange={(val) => {
                            setStatusFilter(val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                            <SelectItem value="BANNED">Bị khóa</SelectItem>
                            <SelectItem value="PENDING">Chờ xác thực</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                        <Plus size={18} /> Thêm người dùng
                    </Button>
                </div>
            </div>

            {/* Bảng danh sách */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                        <TableRow>
                            <TableHead className="w-[20%]">Người dùng</TableHead>
                            <TableHead className="w-[15%]">Email</TableHead>
                            <TableHead className="w-[10%] text-center">Điện thoại</TableHead>
                            <TableHead className="w-[10%] text-center">Quyền hạn</TableHead>
                            <TableHead className="w-[10%] text-center">Trạng thái</TableHead>
                            <TableHead className="w-[13%] text-center">Đăng nhập cuối</TableHead>
                            <TableHead className="w-[10%] text-center">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                    <p className="text-sm text-text-main font-medium mt-2">Đang tải dữ liệu...</p>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-text-main font-medium">
                                    Không tìm thấy người dùng nào khớp với bộ lọc.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => {
                                const roleConf = ROLE_MAP[user.role] || {
                                    label: user.role,
                                    variant: "secondary",
                                };
                                const statusConf = STATUS_MAP[user.status] || {
                                    label: user.status,
                                    variant: "secondary",
                                };

                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt="avatar"
                                                        className="w-12 h-12 rounded-lg object-cover bg-bg-secondary flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg flex bg-gray-200 items-center justify-center font-medium text-primary flex-shrink-0">
                                                        {user.username?.charAt(0).toUpperCase() || "?"}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm text-text-main">
                                                        {user.username}
                                                    </p>
                                                    <p className="text-xs text-text-secondary">
                                                        {`${user.first_name} ${user.last_name}`.trim()}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {<span className="text-sm text-text-main font-medium">{user.email}</span>}
                                        </TableCell>
                                        <TableCell className="text-center ">
                                            {<span className="text-sm text-text-main font-medium">{user.phone}</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={roleConf.variant} className={`border-0 ${roleConf.className || ""}`}>
                                                {roleConf.label}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <Badge variant={statusConf.variant} className="border-0">
                                                {statusConf.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-text-main font-medium">
                                            {user.last_login ? formatDate(user.last_login) : ""}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleEditUser(user)}
                                                    title="Chỉnh sửa"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleChangePassword(user)}
                                                    title="Đổi mật khẩu"
                                                    className="h-8 w-8 text-orange-600 hover:text-orange-800 hover:bg-orange-50 cursor-pointer"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleAssignRole(user)}
                                                    title="Phân quyền"
                                                    className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-50 cursor-pointer"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDeleteUserConfirm(user)}
                                                    title="Xóa tài khoản"
                                                    className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <PaginationControls
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    itemsLength={users.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                />
            </Card>

            {/* Modals */}
            {isEditModalOpen && selectedUser && (
                <UserEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={selectedUser}
                    onUserUpdated={fetchUsers}
                />
            )}
            {isChangePasswordModalOpen && selectedUser && (
                <UserChangePasswordModal
                    isOpen={isChangePasswordModalOpen}
                    onClose={() => setIsChangePasswordModalOpen(false)}
                    user={selectedUser}
                />
            )}
            {isRoleModalOpen && selectedUser && (
                <UserRoleModal
                    isOpen={isRoleModalOpen}
                    onClose={() => setIsRoleModalOpen(false)}
                    user={selectedUser}
                    onUserUpdated={fetchUsers}
                />
            )}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeDeleteUser}
                title="Xóa tài khoản"
                description={
                    <>
                        Bạn có chắc chắn muốn xóa tài khoản{" "}
                        <span className="font-bold text-text-main font-medium">{selectedUser?.username}</span> không?
                        Hành động này sẽ xóa toàn bộ dữ liệu liên quan và không thể hoàn tác.
                    </>
                }
                confirmText="Xóa tài khoản"
                variant="danger"
            />
            {isCreateModalOpen && (
                <UserCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onUserCreated={fetchUsers}
                />
            )}
        </div>
    );
};

export default UserManagement;
