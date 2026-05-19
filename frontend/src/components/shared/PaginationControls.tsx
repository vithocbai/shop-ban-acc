import React from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    // Trang hiện tại (1-indexed)
    page: number;
    // Kích thước trang (số bản ghi hiển thị trên mỗi trang)
    pageSize: number;
    // Tổng số bản ghi khớp trong hệ thống
    total: number;
    // Số lượng bản ghi thực tế của mảng hiển thị trên trang hiện tại
    itemsLength: number;
    // Tên của thực thể hiển thị (ví dụ: "game", "tài khoản", "giao dịch")
    itemName?: string;
    // Hàm callback khi người dùng thay đổi trang
    onPageChange: (newPage: number) => void;
    // Hàm callback khi người dùng thay đổi số hàng trên mỗi trang
    onPageSizeChange: (newPageSize: number) => void;
    // Danh sách các lựa chọn kích thước trang
    pageSizeOptions?: number[];
}

/**
 * Component PaginationControls (Phân trang dùng chung)
 * Tách biệt thành 3 phần chuẩn UI:
 * - Trái: "Hiển thị [page_size] trên mỗi trang"
 * - Giữa: [<] [1] [2] [>] (Các nút chuyển số trang trực quan)
 * - Phải: "Hiển thị X - Y trong tổng số Z game"
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100]
}) => {
    
    // Tính toán tổng số trang
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Điều hướng trang trước
    const handlePrevious = () => {
        if (page > 1) {
            onPageChange(page - 1);
        }
    };

    // Điều hướng trang sau
    const handleNext = () => {
        if (page < totalPages) {
            onPageChange(page + 1);
        }
    };

    // Tạo mảng số trang hiển thị (hỗ trợ hiển thị dấu rút gọn "..." nếu quá nhiều trang)
    const getVisiblePageNumbers = () => {
        const pages: (number | string)[] = [];
        const range = 1; // Số trang lân cận trang hiện tại cần hiển thị

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= page - range && i <= page + range)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    const visiblePages = getVisiblePageNumbers();

    return (
        <div className="px-6 py-4 bg-bg-secondary/50 border-t border-border-color grid grid-cols-1 md:grid-cols-2 items-center justify-between gap-4 w-full">
            {/* Phía trái: Cấu hình số hàng hiển thị trên mỗi trang */}
            <div className="flex items-center gap-2 md:justify-self-start justify-center">
                <span className="text-sm text-text-secondary font-medium whitespace-nowrap">
                    Hiển thị
                </span>
                <select
                    id="reusable-select-rows-per-page"
                    value={pageSize}
                    onChange={(e) => {
                        const newSize = Number(e.target.value);
                        onPageSizeChange(newSize);
                    }}
                    className="h-9 px-2 rounded-md border border-border-color bg-white text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                >
                    {pageSizeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <span className="text-sm text-text-secondary font-medium whitespace-nowrap">
                    trên mỗi trang
                </span>
            </div>

            {/* Phía phải: Các nút bấm điều hướng trang cụ thể */}
            <div className="flex items-center gap-1.5 md:justify-self-end justify-end">
                {/* Nút lùi về trang trước */}
                <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={handlePrevious}
                    className={`h-9 w-9 p-0 flex items-center justify-center bg-white border border-border-color rounded-md ${
                        page === 1 ? "opacity-50 text-text-secondary/40 disabled:pointer-events-auto disabled:cursor-not-allowed" : "text-text-main hover:bg-bg-secondary cursor-pointer"
                    }`}
                >
                    <ChevronLeft size={16} />
                </Button>

                {/* Các nút số trang hiển thị */}
                {visiblePages.map((pageNumber, idx) => {
                    if (pageNumber === "...") {
                        return (
                            <span key={`dots-${idx}`} className="px-2 text-text-secondary select-none">
                                ...
                            </span>
                        );
                    }
                    const isCurrent = page === pageNumber;
                    return (
                        <Button
                            key={pageNumber}
                            variant={isCurrent ? "default" : "outline"}
                            onClick={() => onPageChange(Number(pageNumber))}
                            className={`h-9 w-9 p-0 rounded-md font-medium text-sm transition-colors cursor-pointer ${
                                isCurrent
                                    ? "bg-black text-white hover:bg-black/90 font-bold"
                                    : "bg-white border border-border-color text-text-secondary hover:text-text-main hover:bg-bg-secondary"
                            }`}
                        >
                            {pageNumber}
                        </Button>
                    );
                })}

                {/* Nút tiến tới trang sau */}
                <Button
                    variant="outline"
                    size="icon"
                    disabled={page >= totalPages}
                    onClick={handleNext}
                    className={`h-9 w-9 p-0 flex items-center justify-center bg-white border border-border-color rounded-md ${
                        page >= totalPages ? "opacity-50 text-text-secondary/40 disabled:pointer-events-auto disabled:cursor-not-allowed" : "text-text-main hover:bg-bg-secondary cursor-pointer"
                    }`}
                >
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    );
};
