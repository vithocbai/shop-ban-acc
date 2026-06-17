import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Loader2, X, Edit } from "lucide-react";
import { toast } from "react-toastify";
import { newsService, type Category } from "@/features/news/services/news.service";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface CategoryManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryChanged?: () => void;
}

export default function CategoryManagementModal({ isOpen, onClose, onCategoryChanged }: CategoryManagementModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ title: "", description: "" });
    const [saving, setSaving] = useState(false);

    // Action
    const [selectedCategoryId, setSelectedCategoryId] = useState<Category | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            resetForm();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await newsService.getCategories();
            setCategories(data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách danh mục");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ title: "", description: "" });
    };

    const handleEdit = (cat: Category) => {
        setIsEditing(true);
        setEditingId(cat.id);
        setFormData({ title: cat.title, description: cat.description || "" });
    };

    const handleDeleteClick = (categories: Category) => {
        setSelectedCategoryId(categories);
        setIsDeleteModalOpen(true);
    }

    const confirmDelete = async () => {
        if(!selectedCategoryId) return;
        try {
            await newsService.deleteCategory(selectedCategoryId.id);
            toast.success("Xóa danh mục thành công");
            fetchCategories();
            if (onCategoryChanged) onCategoryChanged();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể xóa danh mục");
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error("Vui lòng nhập tên danh mục");
            return;
        }

        setSaving(true);
        try {
            if (isEditing && editingId) {
                await newsService.updateCategory(editingId, formData);
                toast.success("Cập nhật danh mục thành công");
            } else {
                await newsService.createCategory(formData);
                toast.success("Thêm danh mục thành công");
            }
            resetForm();
            fetchCategories();
            if (onCategoryChanged) onCategoryChanged();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-xl font-bold text-text-main">Quản lý Danh mục Tin tức</h3>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer" onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar bg-bg-secondary/30">
                    {/* Left: Form */}
                    <div className="w-full md:w-1/3 shrink-0">
                        <div className="bg-bg-secondary p-4 rounded-md border border-border-color">
                            <h3 className="font-medium text-text-main mb-4">
                                {isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-medium text-text-main">Tên danh mục <span className="text-error">*</span></Label>
                                    <Input 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="Ví dụ: Khuyến mãi"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-medium text-text-main">Mô tả (tuỳ chọn)</Label>
                                    <Input 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Mô tả ngắn gọn..."
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" disabled={saving} className="flex-1">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                        {isEditing ? "Cập nhật" : "Thêm mới"}
                                    </Button>
                                    {isEditing && (
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            Hủy
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right: Table */}
                    <div className="w-full md:w-2/3 border border-border-color rounded-md overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            <Table>
                                <TableHeader className="sticky top-0 bg-bg-secondary z-10">
                                    <TableRow>
                                        <TableHead>Tên danh mục</TableHead>
                                        <TableHead>Đường dẫn (Slug)</TableHead>
                                        <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-text-secondary">
                                                Chưa có danh mục nào.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((cat) => (
                                            <TableRow key={cat.id}>
                                                <TableCell className="font-medium text-text-main">{cat.title}</TableCell>
                                                <TableCell className="text-text-secondary text-sm">{cat.slug}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleEdit(cat)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteClick(cat)}
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
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Xóa danh mục"
                description={<>Bạn có chắc chắn muốn xóa danh mục <span className="font-medium text-text-main">"{selectedCategoryId?.title}"</span> Hành động này không thể hoàn tác.</>}
                confirmText="Xóa danh mục"
                cancelText="Hủy"
                variant="danger"
            />
        </div>
    );

    
}
