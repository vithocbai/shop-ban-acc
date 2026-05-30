import React, { useEffect, useState, useCallback } from "react";
import { userService } from "../services/user.service";
import type { User, UserFilters } from "../types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { toast } from "react-toastify";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import UserDetailModal from "./UserDetailModal";

const ROLE_MAP: Record<string, { label: string; color: string }> = {
    USER: { label: "Người dùng", color: "bg-gray-200 text-black" },
    ADMIN: { label: "Admin", color: "bg-primary text-white" },
    SUPER_ADMIN: { label: "Super Admin", color: "bg-purple-600 text-white" },
    MODERATOR: { label: "Moderator", color: "bg-blue-500 text-white" },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "Hoạt động", color: "bg-success text-white" },
    BANNED: { label: "Bị khóa", color: "bg-error text-white" },
    PENDING: { label: "Chờ xác thực", color: "bg-warning text-white" },
};

const UserList: React.FC = () => {
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
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleViewDetail = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleUserUpdated = () => {
        fetchUsers();
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
            {/* Thanh công cụ tìm kiếm và lọc */}
            <div className="pb-2 px-[1px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-0">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary z-10">
                            <Search size={18} />
                        </div>
                        <Input
                            placeholder="Email hoặc username..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(1); }}>
                        <SelectTrigger className="w-[180px] bg-bg-secondary border-border-color">
                            <SelectValue placeholder="Tất cả quyền" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả quyền</SelectItem>
                            <SelectItem value="USER">Người dùng</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MODERATOR">Moderator</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                        <SelectTrigger className="w-[180px] bg-bg-secondary border-border-color">
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
            </div>

            {/* Bảng danh sách */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Tài khoản</TableHead>
                                <TableHead className="text-right">Số dư (VNĐ)</TableHead>
                                <TableHead className="text-center">Quyền</TableHead>
                                <TableHead className="text-center">Trạng thái</TableHead>
                                <TableHead className="text-center">Ngày tạo</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                        <p className="text-sm text-text-secondary mt-2">Đang tải dữ liệu...</p>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-text-secondary">
                                        Không tìm thấy người dùng nào khớp với bộ lọc.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => {
                                    const roleConf = ROLE_MAP[user.role] || { label: user.role, color: "bg-gray-200 text-black" };
                                    const statusConf = STATUS_MAP[user.status] || { label: user.status, color: "bg-gray-200 text-black" };

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-bold text-text-main">
                                                #{user.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover bg-bg-secondary" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                            {user.username?.charAt(0).toUpperCase() || "?"}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-sm text-text-main">{user.username || "Chưa cập nhật"}</p>
                                                        <p className="text-xs text-text-secondary">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-success">
                                                {formatPrice(Number(user.balance))}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={roleConf.color}>{roleConf.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={statusConf.color}>{statusConf.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-text-secondary">
                                                {new Date(user.created_at).toLocaleDateString("vi-VN")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="gap-1 h-8 px-2 border-border-color cursor-pointer"
                                                    onClick={() => handleViewDetail(user)}
                                                >
                                                    <Edit size={14} />
                                                    Chi tiết
                                                </Button>
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
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    pageSizeOptions={[10, 20, 50]}
                />
            </Card>

            {isModalOpen && selectedUser && (
                <UserDetailModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    user={selectedUser}
                    onUserUpdated={handleUserUpdated}
                />
            )}
        </div>
    );
};

export default UserList;
