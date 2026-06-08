import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Loader2, Search, Plus, Eye, Edit, Trash2, Layers } from "lucide-react";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { newsService, type Article, type Category } from "@/features/news/services/news.service";
import { useNavigate } from "react-router-dom";
import CategoryManagementModal from "./CategoryManagementModal";

export default function NewsManagement() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [search, setSearch] = useState<string>("");

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);

    // Actions
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initial Load Categories
    const fetchCategories = async () => {
        try {
            const cats = await newsService.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Load Articles
    const fetchArticles = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, page_size: pageSize };
            if (statusFilter !== "all") params.status = statusFilter;
            if (categoryFilter !== "all") params.category = categoryFilter;
            if (search.trim()) params.search = search.trim();

            const data = await newsService.getArticles(params);
            const results = data?.results || data?.items || [];
            
            setArticles(results);
            setTotal(data?.count ?? data?.total ?? results.length);
        } catch (error) {
            console.error("Lỗi tải bài viết:", error);
            toast.error("Không thể tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [page, pageSize, statusFilter, categoryFilter, search]);

    // Handle Delete
    const handleDeleteClick = (article: Article) => {
        setSelectedArticle(article);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedArticle) return;
        setIsDeleting(true);
        try {
            await newsService.deleteArticle(selectedArticle.id);
            toast.success("Xóa bài viết thành công!");
            setIsDeleteModalOpen(false);
            // Refresh list
            if (articles.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                fetchArticles();
            }
        } catch (error: any) {
            console.error("Lỗi xóa bài viết:", error);
            toast.error(error.response?.data?.message || "Lỗi xóa bài viết");
        } finally {
            setIsDeleting(false);
            setSelectedArticle(null);
        }
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN")}`;
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Tin tức</h1>
                    <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa bài viết và hướng dẫn</p>
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
                            placeholder="Tìm theo tiêu đề hoặc URL..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Tất cả danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả danh mục</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[180px] border-border-color">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="PUBLISHED">Đã đăng</SelectItem>
                            <SelectItem value="DRAFT">Lưu nháp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)} className="gap-2">
                        <Layers className="h-4 w-4" />
                        Quản lý danh mục
                    </Button>
                    <Button onClick={() => navigate("/admin/news/create")} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4" />
                        Thêm bài viết
                    </Button>
                </div>
            </div>

            {/* Bảng danh sách */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                <Table className="bg-white" containerClassName="flex-1 overflow-auto min-h-0">
                    <TableHeader className="sticky top-0 z-10 bg-bg-secondary">
                        <TableRow>
                            <TableHead className="w-[35%]">Bài viết</TableHead>
                            <TableHead className="w-[15%]">Danh mục</TableHead>
                            <TableHead className="w-[10%]">Tác giả</TableHead>
                            <TableHead className="w-[10%] text-center">Lượt xem</TableHead>
                            <TableHead className="w-[10%] text-center">Trạng thái</TableHead>
                            <TableHead className="w-[15%] text-center">Ngày đăng</TableHead>
                            <TableHead className="w-[5%] text-center">Thao tác</TableHead>
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
                        ) : articles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-text-secondary">
                                    Không tìm thấy bài viết nào khớp với bộ lọc.
                                </TableCell>
                            </TableRow>
                        ) : (
                            articles.map((article) => {
                                const isPublished = article.status === "PUBLISHED" && article.is_visible;
                                return (
                                    <TableRow key={article.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {article.thumbnail ? (
                                                    <img src={article.thumbnail} alt={article.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-gray-400 text-xs">No img</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-sm text-text-main line-clamp-2" title={article.title}>
                                                        {article.title}
                                                    </p>
                                                    <p className="text-xs text-text-secondary line-clamp-1" title={article.slug}>
                                                        /{article.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-text-secondary">
                                                {article.category?.title || ""}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">
                                                {article.author?.fullName || ""}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="flex items-center gap-1 mx-auto w-fit">
                                                <Eye className="w-4 h-4" />
                                                {article.view_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isPublished ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">
                                                    Đã đăng
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-0">
                                                    Bản nháp / Ẩn
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-text-secondary">
                                            {formatDate(article.published_at)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/admin/news/edit/${article.id}`)}
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(article)}
                                                    className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                    itemsLength={articles.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    pageSizeOptions={[10, 20, 50, 100]}
                />
            </Card>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Xóa bài viết"
                description={`Bạn có chắc chắn muốn xóa bài viết "${selectedArticle?.title}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa bài viết"
                cancelText="Hủy"
                variant="danger"
                isLoading={isDeleting}
            />

            <CategoryManagementModal 
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onCategoryChanged={fetchCategories}
            />
        </div>
    );
}
