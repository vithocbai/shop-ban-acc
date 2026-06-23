import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Loader2,
    DollarSign,
    ShoppingCart,
    Gamepad2,
    Users,
    Wallet,
    FileDown,
    Calendar as CalendarIcon,
    FolderUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { formatDate, formatPrice } from "@/lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import type { LiveData, OverviewData } from "@/features/dashboard/types";

// ---- Sub-components ----
function SectionError({ message = "Không thể tải dữ liệu" }: { message?: string }) {
    return (
        <div className="flex items-center justify-center h-full min-h-[80px] text-sm text-red-500 bg-red-50 rounded-md">
            ⚠️ {message}
        </div>
    );
}

function StatSkeleton() {
    return <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Dashboard() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    });

    // State quản lý việc mở/đóng của Popover
    const [isOpen, setIsOpen] = useState(false);
    // State tạm thời để lưu giá trị khi người dùng đang click chọn Lịch (chưa bấm Áp dụng)
    const [tempDate, setTempDate] = useState<DateRange | undefined>(date);

    const queryParams = {
        start_date: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
        end_date: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
    };

    // [STATIC] Dữ liệu nặng, ít thay đổi → staleTime 5 phút
    const { data: overview, isLoading: overviewLoading } = useQuery<OverviewData>({
        queryKey: ["dashboard-overview", queryParams],
        queryFn: () => dashboardService.getOverview(queryParams),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });

    // [DYNAMIC] Đơn hàng mới nhất → poll mỗi 30 giây
    const { data: live } = useQuery<LiveData>({
        queryKey: ["dashboard-live"],
        queryFn: dashboardService.getLive,
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000,
    });

    const handleExport = async (formatType: "excel" | "pdf") => {
        try {
            toast.info(`Đang tạo báo cáo ${formatType.toUpperCase()}...`);
            await dashboardService.exportReport(formatType, queryParams);
            toast.success("Tải báo cáo thành công!");
        } catch (error) {
            toast.error("Lỗi khi tải báo cáo.");
        }
    };

    // Chỉ block toàn trang khi lần đầu load (overview chưa có gì)
    if (overviewLoading && !overview) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    



    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto pr-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-lg:gap-0 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-text-main leading-tight max-lg:hidden">Tổng quan hệ thống</h1>
                </div>
                {/* Filters & Export Actions */}
                <div className="flex flex-wrap items-center gap-4 ml-auto">
                    <div className="flex items-center bg-white rounded-md border border-border-color p-1 shadow-sm h-10">
                        <Popover
                            open={isOpen}
                            onOpenChange={(open) => {
                                if (open) {
                                    setTempDate(date); // Khi mở popover thì lấy giá trị hiện tại
                                }
                                setIsOpen(open);
                            }}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={`justify-start text-left font-normal h-8 px-4 ${!date && "text-muted-foreground"}`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                                            </>
                                        ) : (
                                            format(date.from, "dd/MM/yyyy")
                                        )
                                    ) : (
                                        <span>Chọn khoảng thời gian</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="range"
                                    defaultMonth={tempDate?.from}
                                    selected={tempDate}
                                    onSelect={setTempDate}
                                    numberOfMonths={2}
                                    locale={vi}
                                />
                                <div className="flex items-center justify-end gap-2 p-3 border-t border-border-color">
                                    <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                                        Hủy
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setDate(tempDate);
                                            setIsOpen(false);
                                        }}
                                    >
                                        Áp dụng
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="h-10 bg-primary hover:bg-primary/90">
                                <FolderUp className="mr-2 h-4 w-4" />
                                Xuất báo cáo
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleExport("excel")} className="cursor-pointer">
                                <FileDown className="mr-2 h-4 w-4 text-green-600" />
                                <span>Xuất Excel (.xlsx)</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer">
                                <FileDown className="mr-2 h-4 w-4 text-red-500" />
                                <span>Xuất PDF</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Tổng doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-center">
                        <div>
                            {overview?.summary_cards ? (
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatPrice(overview.summary_cards.total_revenue)}
                                </div>
                            ) : (
                                <StatSkeleton />
                            )}
                            <p className="text-xs text-gray-400 mt-1">Doanh thu trong kỳ lọc</p>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-md">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-center">
                        <div>
                            {overview?.summary_cards ? (
                                <div className="text-2xl font-bold text-green-600">
                                    {overview.summary_cards.total_orders}
                                </div>
                            ) : (
                                <StatSkeleton />
                            )}
                            <p className="text-xs text-gray-400 mt-1">Tổng đơn đã tạo</p>
                        </div>
                        <div className="bg-green-100 p-2 rounded-md">
                            <ShoppingCart className="h-5 w-5 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Tài khoản đã bán</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-center">
                        <div>
                            {overview?.summary_cards ? (
                                <div className="text-2xl font-bold text-purple-600">
                                    {overview.summary_cards.accounts_sold}
                                </div>
                            ) : (
                                <StatSkeleton />
                            )}
                            <p className="text-xs text-gray-400 mt-1">Thanh toán thành công</p>
                        </div>
                        <div className="bg-purple-100 p-2 rounded-md">
                            <Gamepad2 className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Người dùng mới</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-center">
                        <div>
                            {overview?.summary_cards ? (
                                <div className="text-2xl font-bold text-amber-600">
                                    {overview.summary_cards.new_users}
                                </div>
                            ) : (
                                <StatSkeleton />
                            )}
                            <p className="text-xs text-gray-400 mt-1">Đăng ký trong kỳ lọc</p>
                        </div>
                        <div className="bg-amber-100 p-2 rounded-md">
                            <Users className="h-5 w-5 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-rose-500 shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Nạp tiền thành công</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-center">
                        <div>
                            {overview?.summary_cards ? (
                                <div className="text-2xl font-bold text-rose-600">
                                    {formatPrice(overview.summary_cards.total_deposits)}
                                </div>
                            ) : (
                                <StatSkeleton />
                            )}
                            <p className="text-xs text-gray-400 mt-1">Tổng tiền nạp ví</p>
                        </div>
                        <div className="bg-rose-100 p-2 rounded-md">
                            <Wallet className="h-5 w-5 text-rose-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="border-b mb-4 p-4">
                        <CardTitle className="text-base font-bold text-gray-800">Biểu đồ doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] p-4">
                        {overview?.revenue_chart ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={overview.revenue_chart}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={15} />
                                    <YAxis
                                        yAxisId="left"
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, "auto"]}
                                        ticks={overview.revenue_chart.every(item => item.revenue === 0) ? [0] : undefined}
                                        tickFormatter={(val) => {
                                            const num = Number(val);
                                            if (num === 0) return "0đ";
                                            if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
                                            if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
                                            return `${num}đ`;
                                        }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, "auto"]}
                                        allowDecimals={false}
                                        ticks={overview.revenue_chart.every(item => item.orders === 0) ? [0] : undefined}
                                        tickFormatter={(val) => `${val} đơn`}
                                    />
                                    <Tooltip
                                        formatter={(value: any, name: any) => {
                                            if (name === "Doanh thu") return [formatPrice(value), "Doanh thu"];
                                            return [value + " đơn", "Đơn hàng"];
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="orders"
                                        name="Đơn hàng"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Doanh thu"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <SectionError message="Không thể tải biểu đồ doanh thu" />
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="border-b mb-4 p-4">
                        <CardTitle className="text-base font-bold text-gray-800">Doanh thu theo game</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center p-4">
                        {overview?.game_breakdown ? (
                            overview.game_breakdown.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={overview.game_breakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {overview.game_breakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatPrice(value)} />
                                        <Legend layout="vertical" verticalAlign="bottom" align="center" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-sm text-gray-500">Chưa có dữ liệu doanh thu game nào</div>
                            )
                        ) : (
                            <SectionError message="Không thể tải biểu đồ doanh thu theo game" />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="border-b p-4">
                        <CardTitle className="text-base font-bold text-gray-800">Đơn hàng mới nhất</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {live?.recent_orders == null ? (
                            <SectionError message="Không thể tải đơn hàng" />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Khách hàng</TableHead>
                                        <TableHead>Giá trị</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Thời gian</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {live.recent_orders.slice(0,5).map((order, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{order.customer}</TableCell>
                                            <TableCell className="font-medium">{formatPrice(order.value)}</TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-500">
                                                    Thành công
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">{order.time}</TableCell>
                                        </TableRow>
                                    ))}
                                    {live.recent_orders.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-20 text-gray-500">
                                                Chưa có đơn hàng nào
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader className="border-b p-4">
                            <CardTitle className="text-base font-bold text-gray-800">Thống kê nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-2 gap-4">
                            {overview?.quick_stats == null ? (
                                <SectionError message="Không thể tải thống kê" />
                            ) : (
                                <>
                                    <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg">
                                        <span className="text-gray-500 text-xs mb-1">Đang bán</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            {overview.quick_stats.selling_accounts}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg">
                                        <span className="text-gray-500 text-xs mb-1">Đã bán</span>
                                        <span className="text-xl font-bold text-red-600">
                                            {overview.quick_stats.sold_accounts}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg">
                                        <span className="text-gray-500 text-xs mb-1">Bị khóa</span>
                                        <span className="text-xl font-bold text-purple-600">
                                            {overview.quick_stats.locked_accounts}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg">
                                        <span className="text-gray-500 text-xs mb-1">Online</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {live?.online_users ?? 0}
                                        </span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
