import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Loader2, Plus, Edit, Trash2, Search } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { bannerService, type Banner } from "@/features/banner/services/banner.service";
import BannerModal from "./BannerModal";
import { Input } from "@/components/ui/input";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "@/components/shared/PaginationControls";

export default function BannerManagement() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);


    const getPositionLabel = (position: string) => {
        switch (position) {
            case 'HOME_TOP': return 'Trang chủ - Top';
            case 'HOME_MIDDLE': return 'Trang chủ - Giữa';
            case 'HOME_BOTTOM': return 'Trang chủ - Dưới';
            case 'SIDEBAR': return 'Sidebar';
            default: return position;
        }
    };

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, page_size: pageSize };
            if (search.trim()) params.search = search.trim();
            if (categoryFilter !== "all") params.position = categoryFilter;
            if (statusFilter !== "all") params.is_active = statusFilter === "true";

            const data = await bannerService.getBanners(params);
            setBanners(data?.items || data || []);
            setTotal(data?.total || 0);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách Banner");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [page, pageSize, statusFilter, categoryFilter, search]);

    const handleAdd = () => {
        setSelectedBanner(null);
        setIsModalOpen(true);
    };

    const handleEdit = (banner: Banner) => {
        setSelectedBanner(banner);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (banner: Banner) => {
        setSelectedBanner(banner);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedBanner) return;
        setIsDeleting(true);
        try {
            await bannerService.deleteBanner(selectedBanner.id);
            toast.success("Đã xóa Banner thành công");
            setIsDeleteModalOpen(false);
            fetchBanners();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể xóa Banner");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 gap-4 bg-bg-secondary">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Banner</h1>
                        <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa banner và slider</p>
                    </div>
                </div>
            </div>

            {/* Thanh công cụ tìm kiếm và lọc */}
            <div className="pb-2 px-[1px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-0">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary z-10">
                            <Search size={18} />
                        </div>
                        <Input
                            placeholder="Tìm theo tiêu đề mô tả hoặc link url"
                            className="pl-10"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <Select
                        value={categoryFilter}
                        onValueChange={(v) => {
                            setCategoryFilter(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả vị trí</SelectItem>
                            <SelectItem value="HOME_TOP">Trang chủ - Top</SelectItem>
                            <SelectItem value="HOME_MIDDLE">Trang chủ - Giữa</SelectItem>
                            <SelectItem value="HOME_BOTTOM">Trang chủ - Dưới</SelectItem>
                            <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                            setStatusFilter(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="true">Hiển thị</SelectItem>
                            <SelectItem value="false">Không hiển thị</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                        <Plus size={18} />
                        Thêm banner
                    </Button>
                </div>
            </div>

            {/* Danh sách */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                        <TableRow>
                            <TableHead className="w-[10%]">Hình ảnh</TableHead>
                            <TableHead className="w-[30%]">Tiêu đề</TableHead>
                            <TableHead className="w-[15%]">Vị trí</TableHead>
                            <TableHead className="w-[10%] text-center">Thứ tự</TableHead>
                            <TableHead className="w-[15%] text-center">Trạng thái</TableHead>
                            <TableHead className="w-[10%] text-center">Ngày tạo</TableHead>
                            <TableHead className="w-[10%] text-center">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                    <p className="text-sm text-text-secondary mt-2">Đang tải dữ liệu...</p>
                                </TableCell>
                            </TableRow>
                        ) : banners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-text-secondary">
                                    Không tìm thấy Banner nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            banners.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-16 h-16 object-cover rounded-md  border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-24 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-text-main">
                                        <div className="line-clamp-2">{item.title}</div>
                                    </TableCell>
                                    <TableCell className="font-medium text-text-main">
                                        {getPositionLabel(item.position)}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">{item.sort_order}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={item.is_active ? "success" : ("secondary" as any)}>
                                            {item.is_active ? "Hiển thị" : "Không hiển thị"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-text-main">
                                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteClick(item)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <PaginationControls
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    itemsLength={banners.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    pageSizeOptions={[10, 20, 50, 100]}
                />
            </Card>

            {/* Modals */}
            <BannerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchBanners}
                banner={selectedBanner}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Xác nhận xóa Banner"
                description={
                    <>
                        Bạn có chắc chắn muốn xóa Banner <strong>{selectedBanner?.title}</strong>? Hành động này không
                        thể hoàn tác.
                    </>
                }
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDeleteConfirm}
                variant="danger"
            />
        </div>
    );
}
