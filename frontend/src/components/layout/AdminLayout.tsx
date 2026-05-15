import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Gamepad2, 
  ClipboardList, 
  Zap, 
  Users, 
  CircleDollarSign,
  UserCircle,
  ChevronDown,
  ChevronRight,
  Newspaper,
  Settings,
  BarChart3,
  CreditCard,
  History,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  to?: string;
  children?: { label: string; to: string; icon: React.ReactNode }[];
}

const NavItem: React.FC<{ item: MenuItem; isActive: boolean; isOpen: boolean; onToggle: () => void }> = ({ 
  item, isActive, isOpen, onToggle 
}) => {
  const location = useLocation();
  const hasChildren = !!item.children;
  if (!hasChildren) {
    return (
      <Link 
        to={item.to!} 
        className={`flex items-center px-4 py-3 mb-1 rounded-md transition-all duration-200 ${
          isActive 
            ? 'bg-blue-50 text-primary font-medium' 
            : 'text-text-secondary hover:bg-bg-secondary hover:text-primary'
        }`}
      >
        <span className="mr-3">{item.icon}</span>
        <span className="text-sm">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="mb-1">
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 ${
          isActive ? 'text-primary font-medium' : 'text-text-secondary hover:bg-bg-secondary hover:text-primary'
        }`}
      >
        <div className="flex items-center">
          <span className="mr-3">{item.icon}</span>
          <span className="text-sm">{item.label}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      
      {isOpen && (
        <div className="ml-9 mt-1 space-y-1">
          {item.children?.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className={`flex items-center px-4 py-2 text-xs rounded-md transition-all ${
                location.pathname === child.to 
                  ? 'text-primary font-bold bg-blue-50' 
                  : 'text-text-secondary hover:text-primary hover:bg-bg-secondary'
              }`}
            >
              <span className="mr-2 opacity-70">{child.icon}</span>
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Tài khoản': true,
    'Đơn hàng': false,
    'Người dùng': false,
    'Nạp tiền': false,
    'Nội dung': false,
    'Cấu hình': false,
  });

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const menuItems: MenuItem[] = [
    { label: 'Báo cáo thống kê', icon: <BarChart3 size={20} />, to: '/admin/dashboard' },
    { 
      label: 'Quản lý tài khoản', 
      icon: <Gamepad2 size={20} />, 
      children: [
        { label: 'Tài khoản game', to: '/admin/accounts', icon: <ClipboardList size={14} /> },
        { label: 'Danh mục game', to: '/admin/games', icon: <Gamepad2 size={14} /> },
      ]
    },
    { 
      label: 'Quản lý đơn hàng', 
      icon: <Zap size={20} />, 
      children: [
        { label: 'Danh sách đơn hàng', to: '/admin/orders', icon: <FileText size={14} /> },
        { label: 'Lịch sử giao dịch', to: '/admin/transactions', icon: <History size={14} /> },
      ]
    },
    { 
      label: 'Quản lý người dùng', 
      icon: <Users size={20} />, 
      children: [
        { label: 'Danh sách người dùng', to: '/admin/users', icon: <Users size={14} /> },
        { label: 'Phân quyền', to: '/admin/roles', icon: <ShieldCheck size={14} /> },
        { label: 'Nhóm người dùng', to: '/admin/user-groups', icon: <Users size={14} /> },
      ]
    },
    { 
      label: 'Quản lý nạp tiền', 
      icon: <CircleDollarSign size={20} />, 
      children: [
        { label: 'Nạp tiền thủ công', to: '/admin/deposits/manual', icon: <CircleDollarSign size={14} /> },
        { label: 'Thẻ nạp', to: '/admin/deposits/cards', icon: <CreditCard size={14} /> },
        { label: 'Lịch sử nạp tiền', to: '/admin/deposits/history', icon: <History size={14} /> },
      ]
    },
    { 
      label: 'Quản lý nội dung', 
      icon: <Newspaper size={20} />, 
      children: [
        { label: 'Tin tức', to: '/admin/news', icon: <Newspaper size={14} /> },
        { label: 'Banner', to: '/admin/banners', icon: <ImageIcon size={14} /> },
        { label: 'Thông báo hệ thống', to: '/admin/notifications', icon: <Bell size={14} /> },
      ]
    },
    { 
      label: 'Cấu hình hệ thống', 
      icon: <Settings size={20} />, 
      children: [
        { label: 'Cài đặt chung', to: '/admin/settings/general', icon: <Settings size={14} /> },
        { label: 'Cài đặt thanh toán', to: '/admin/settings/payment', icon: <CreditCard size={14} /> },
        { label: 'Cài đặt bảo mật', to: '/admin/settings/security', icon: <ShieldCheck size={14} /> },
        { label: 'Nhật ký hệ thống', to: '/admin/settings/logs', icon: <FileText size={14} /> },
      ]
    },
  ];

  return (
    <div className="flex min-h-screen bg-bg-secondary font-roboto">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border-color sticky top-0 h-screen flex flex-col overflow-y-auto py-6 scrollbar-hide">
        <div className="px-6 mb-8">
          <h2 className="text-2xl font-bold text-primary tracking-tight">SHOP GAME</h2>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">Hệ thống quản trị</p>
        </div>
        
        <nav className="flex-1 px-3">
          {menuItems.map((item) => (
            <NavItem 
              key={item.label}
              item={item}
              isActive={item.to ? location.pathname === item.to : item.children?.some(c => location.pathname === c.to) || false}
              isOpen={openMenus[item.label]}
              onToggle={() => toggleMenu(item.label)}
            />
          ))}
        </nav>
        
        <div className="px-4 mt-10">
          <button className="w-full flex items-center px-4 py-3 text-error hover:bg-red-50 rounded-md transition-colors text-sm font-medium">
            <span className="mr-3 font-bold">🚪</span>
            <span onClick={() => logout()}>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border-color flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-text-main">
              {/* Tên trang hiện tại */}
              Admin Panel
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-text-main">Quản trị viên</p>
              <p className="text-[11px] text-text-secondary">admin@gamemarket.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary border border-blue-100">
              <UserCircle size={24} />
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
