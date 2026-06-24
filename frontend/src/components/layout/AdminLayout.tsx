import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
    Gamepad2,
    ClipboardList,
    Zap,
    Users,
    CircleDollarSign,
    UserCircle,
    Newspaper,
    Settings,
    CreditCard,
    History,
    ShieldCheck,
    FileText,
    Image as ImageIcon,
    Bell,
    LogOut,
    Menu,
    ChevronRight,
    Search,
    ChevronDown,
    Lock,
    Globe,
    User,
    LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    to?: string;
    children?: { label: string; to: string; icon: React.ReactNode }[];
}

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem("adminSidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev: boolean) => {
            const newState = !prev;
            localStorage.setItem("adminSidebarOpen", JSON.stringify(newState));
            return newState;
        });
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const expanded = isMobile ? true : isSidebarOpen;

    const menuItems: MenuItem[] = [
        { label: "Tổng quan hệ thống", icon: <LayoutDashboard size={20} />, to: "/admin/dashboard" },
        {
            label: "Quản lý tài khoản",
            icon: <Gamepad2 size={20} />,
            children: [
                { label: "Tài khoản game", to: "/admin/accounts", icon: <ClipboardList size={16} /> },
                { label: "Danh mục game", to: "/admin/games", icon: <Gamepad2 size={16} /> },
            ],
        },
        {
            label: "Quản lý đơn hàng",
            icon: <Zap size={20} />,
            children: [
                { label: "Danh sách đơn hàng", to: "/admin/orders", icon: <FileText size={16} /> },
                { label: "Lịch sử giao dịch", to: "/admin/transactions", icon: <History size={16} /> },
            ],
        },
        {
            label: "Quản lý người dùng",
            icon: <Users size={20} />,
            children: [
                { label: "Danh sách người dùng", to: "/admin/users", icon: <Users size={16} /> },
                { label: "Phân quyền", to: "/admin/roles", icon: <ShieldCheck size={16} /> },
                { label: "Nhóm người dùng", to: "/admin/user-groups", icon: <Users size={16} /> },
            ],
        },
        {
            label: "Quản lý nạp tiền",
            icon: <CircleDollarSign size={20} />,
            children: [
                { label: "Nạp tiền thủ công", to: "/admin/deposits/manual", icon: <CircleDollarSign size={16} /> },
                { label: "Thẻ nạp", to: "/admin/deposits/cards", icon: <CreditCard size={16} /> },
                { label: "Lịch sử nạp tiền", to: "/admin/deposits/history", icon: <History size={16} /> },
            ],
        },
        {
            label: "Quản lý nội dung",
            icon: <Newspaper size={20} />,
            children: [
                { label: "Tin tức", to: "/admin/news", icon: <Newspaper size={16} /> },
                { label: "Banner", to: "/admin/banners", icon: <ImageIcon size={16} /> },
                { label: "Thông báo hệ thống", to: "/admin/notifications", icon: <Bell size={16} /> },
            ],
        },
        {
            label: "Cấu hình hệ thống",
            icon: <Settings size={20} />,
            children: [
                { label: "Cài đặt chung", to: "/admin/settings/general", icon: <Settings size={16} /> },
                { label: "Cài đặt thanh toán", to: "/admin/settings/payment", icon: <CreditCard size={16} /> },
                { label: "Cài đặt bảo mật", to: "/admin/settings/security", icon: <ShieldCheck size={16} /> },
                { label: "Nhật ký hệ thống", to: "/admin/settings/logs", icon: <FileText size={16} /> },
            ],
        },
    ];

    return (
        <div className="flex h-screen bg-bg-secondary font-roboto overflow-hidden">
            {/* Mobile Overlay */}
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-border-color h-screen flex flex-col pt-2 pb-6 transition-all duration-300 ${
                    isMobile ? "fixed inset-y-0 left-0 z-50" : "sticky top-0"
                } ${expanded ? "w-68" : "w-20"} ${isMobile && !isMobileOpen ? "-translate-x-full" : "translate-x-0"}`}
            >
                <div className={`mb-4 flex ${expanded ? "justify-center px-2" : "justify-center px-0"} items-center`}>
                    {expanded ? (
                        <Link to="/admin/dashboard" className="block w-84 px-2">
                            <img className="w-full h-14 object-cover" src="/logoshop.svg" alt="Logo Shop" />
                        </Link>
                    ) : (
                        <Link to="/admin/dashboard" className="block">
                            <h2 className="text-2xl font-bold text-primary tracking-tight">
                                <img className="w-44 h-14 object-cover" src="/logoshop.svg" alt="Logo Shop" />
                            </h2>
                        </Link>
                    )}
                </div>

                <nav className="flex-1 px-1 overflow-y-auto scrollbar-hide">
                    <Accordion
                        type="multiple"
                        defaultValue={menuItems.map((item) => item.label)}
                        className="w-full space-y-2"
                    >
                        {menuItems.map((item) => {
                            const hasChildren = !!item.children;
                            const isParentActive = item.to
                                ? location.pathname === item.to
                                : item.children?.some((c) => location.pathname === c.to) || false;

                            if (!hasChildren) {
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.to!}
                                        title={!expanded ? item.label : undefined}
                                        className={`flex items-center rounded-md transition-all duration-200 ${
                                            expanded ? "px-4 py-3" : "justify-center p-3"
                                        } ${
                                            isParentActive
                                                ? "bg-primary text-white font-medium shadow-sm"
                                                : "text-text-secondary font-medium hover:bg-bg-secondary hover:text-primary"
                                        }`}
                                    >
                                        <span className={`${expanded ? "mr-3" : ""}`}>{item.icon}</span>
                                        {expanded && <span className="text-[16px] text-nowrap">{item.label}</span>}
                                    </Link>
                                );
                            }

                            return (
                                <AccordionItem key={item.label} value={item.label} className="border-none">
                                    <AccordionTrigger
                                        onClick={(e) => {
                                            if (!expanded) {
                                                e.preventDefault();
                                                toggleSidebar();
                                            }
                                        }}
                                        title={!expanded ? item.label : undefined}
                                        className={`w-full flex items-center rounded-md transition-all duration-200 no-underline hover:no-underline ${
                                            !expanded
                                                ? "justify-center [&>svg]:hidden p-3"
                                                : "justify-between px-4 py-3"
                                        } ${
                                            isParentActive
                                                ? "bg-primary text-white font-medium shadow-sm"
                                                : "text-text-secondary font-medium hover:bg-bg-secondary hover:text-primary"
                                        }`}
                                    >
                                        <div
                                            className={`flex items-center ${!expanded ? "justify-center w-full" : ""}`}
                                        >
                                            <span className={`${expanded ? "mr-3" : ""}`}>{item.icon}</span>
                                            {expanded && <span className="text-[16px] text-nowrap">{item.label}</span>}
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className={`pb-1 pt-1 ${expanded ? "pl-4" : "hidden"}`}>
                                        <div
                                            className={`space-y-1 mt-1 ${expanded ? "ml-2 border-l border-gray-100" : ""}`}
                                        >
                                            {item.children?.map((child) => {
                                                const isChildActive = location.pathname === child.to;
                                                return (
                                                    <Link
                                                        key={child.to}
                                                        to={child.to}
                                                        title={!expanded ? child.label : undefined}
                                                        className={`flex items-center rounded-md transition-all ${
                                                            expanded ? "px-4 py-2" : "justify-center py-2 px-0"
                                                        } ${
                                                            isChildActive
                                                                ? "text-primary bg-primary/10 font-semibold"
                                                                : "text-text-secondary  hover:text-primary hover:bg-bg-secondary font-medium"
                                                        }`}
                                                    >
                                                        <span className={`${expanded ? "mr-3" : ""} opacity-70`}>
                                                            {expanded ? child.icon : <ChevronRight size={16} />}
                                                        </span>
                                                        {expanded && <span className="text-[15px]">{child.label}</span>}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </nav>

                <div className={`mt-6 ${expanded ? "px-4" : "px-2"}`}>
                    <button
                        onClick={() => logout()}
                        title={!expanded ? "Đăng xuất" : undefined}
                        className={`w-full flex items-center border border-t-2 text-error hover:bg-error/10 cursor-pointer rounded-md transition-colors font-medium ${
                            expanded ? "px-4 py-3 text-sm" : "justify-center p-3"
                        }`}
                    >
                        <span className={`${expanded ? "mr-3" : ""} font-bold`}>
                            <LogOut size={20} />
                        </span>
                        {expanded && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-border-color flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 flex-shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => (isMobile ? setIsMobileOpen(!isMobileOpen) : toggleSidebar())}
                            className="p-2 -ml-2 rounded-md hover:bg-bg-secondary text-text-secondary transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden sm:flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full max-w-[400px]">
                            <Search size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm tài khoản, người dùng, đơn hàng..." 
                                className="bg-transparent border-none outline-none text-sm w-full text-text-main placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 mr-2">
                            <button className="relative p-2 rounded-full hover:bg-gray-100 text-text-secondary transition-colors">
                                <Bell size={24} />
                                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    3
                                </span>
                            </button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 pr-2 rounded-lg transition-colors border border-transparent hover:border-gray-100 outline-none">
                                    <div className="">
                                        {user?.avatar ? (
                                            <img
                                                className="w-9 h-9 rounded-full bg-bg-secondary flex items-center justify-center text-text-main border border-border-color object-cover"
                                                src={`${user.avatar}`}
                                                alt=""
                                            />
                                        ) : (
                                            <span className="w-9 h-9 rounded-full bg-bg-secondary flex items-center justify-center text-text-main border border-border-color">
                                                <UserCircle size={24} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-left hidden sm:block pr-1">
                                        <p className="font-bold text-text-main text-sm capitalize">
                                            {user?.first_name && user?.last_name
                                                ? `${user.first_name} ${user.last_name}`
                                                : `${user?.username || ""}`}
                                        </p>
                                        <p className="text-[12px] text-text-secondary">{user?.email || "Admin"}</p>
                                    </div>
                                    <ChevronDown size={18} className="text-gray-500 hidden sm:block" />
                                </div>
                            </DropdownMenuTrigger>
                            
                            <DropdownMenuContent align="end" className="w-72 bg-white p-2 border border-border-color shadow-lg rounded-xl">
                                <div className="flex items-center gap-3 p-2 mb-2">
                                    {user?.avatar ? (
                                        <img
                                            className="w-12 h-12 rounded-full border border-gray-100 object-cover"
                                            src={`${user.avatar}`}
                                            alt=""
                                        />
                                    ) : (
                                        <span className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center text-text-main border border-gray-100">
                                            <UserCircle size={28} />
                                        </span>
                                    )}
                                    <div className="flex flex-col">
                                        <p className="font-bold text-text-main capitalize">
                                            {user?.first_name && user?.last_name
                                                ? `${user.first_name} ${user.last_name}`
                                                : `${user?.username || "Admin"}`}
                                        </p>
                                        <p className="text-[12px] text-text-secondary">{user?.email || "admin@shopacc.com"}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span className="text-[11px] font-medium text-green-600">Đang online</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <DropdownMenuSeparator className="bg-gray-100" />
                                
                                <DropdownMenuItem className="cursor-pointer py-2.5 px-3 flex items-center gap-3 hover:bg-gray-50 text-text-secondary font-medium rounded-md">
                                    <User size={18} className="text-gray-500" />
                                    <span>Thông tin cá nhân</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2.5 px-3 flex items-center gap-3 hover:bg-gray-50 text-text-secondary font-medium rounded-md">
                                    <Lock size={18} className="text-gray-500" />
                                    <span>Đổi mật khẩu</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2.5 px-3 flex items-center gap-3 hover:bg-gray-50 text-text-secondary font-medium rounded-md">
                                    <Settings size={18} className="text-gray-500" />
                                    <span>Cài đặt giao diện</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2.5 px-3 flex items-center justify-between hover:bg-gray-50 text-text-secondary font-medium rounded-md">
                                    <div className="flex items-center gap-3">
                                        <Globe size={18} className="text-gray-500" />
                                        <span>Ngôn ngữ</span>
                                    </div>
                                    <div className="flex items-center text-gray-400 text-[12px]">
                                        Tiếng Việt <ChevronRight size={14} className="ml-1" />
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2.5 px-3 flex items-center justify-between hover:bg-gray-50 text-text-secondary font-medium rounded-md">
                                    <div className="flex items-center gap-3">
                                        <Bell size={18} className="text-gray-500" />
                                        <span>Thông báo</span>
                                    </div>
                                    <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">3</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-100" />
                                
                                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer py-2.5 px-3 flex items-center gap-3 hover:bg-red-50 text-error font-medium rounded-md">
                                    <LogOut size={18} className="text-error" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="p-4 flex-1 overflow-hidden flex flex-col">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
