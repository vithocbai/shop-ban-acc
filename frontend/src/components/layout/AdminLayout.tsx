import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Gamepad2, 
  ClipboardList, 
  Zap, 
  Users, 
  CircleDollarSign,
  UserCircle
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, label, icon, isActive }) => (
  <Link 
    to={to} 
    className={`flex items-center px-4 py-3 mb-2 rounded-md transition-all duration-200 group ${
      isActive 
        ? 'bg-blue-50 text-primary font-medium' 
        : 'text-text-secondary hover:bg-bg-secondary hover:text-primary'
    }`}
  >
    <span className={`mr-3 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-primary'}`}>
      {icon}
    </span>
    <span>{label}</span>
  </Link>
);

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { to: '/admin/dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/games', label: 'Quản lý Game', icon: <Gamepad2 size={20} /> },
    { to: '/admin/accounts', label: 'Quản lý Acc', icon: <ClipboardList size={20} /> },
    { to: '/admin/orders', label: 'Đơn hàng', icon: <Zap size={20} /> },
    { to: '/admin/users', label: 'Người dùng', icon: <Users size={20} /> },
    { to: '/admin/deposits', label: 'Nạp tiền', icon: <CircleDollarSign size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-bg-secondary font-roboto">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border-color sticky top-0 h-screen flex flex-col py-6">
        <div className="px-6 mb-10">
          <h2 className="text-2xl font-bold text-primary tracking-tight">SHOP GAME</h2>
          <p className="text-xs text-text-secondary font-medium">ADMIN DASHBOARD</p>
        </div>
        
        <nav className="flex-1 px-4">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to}
              {...item}
              isActive={location.pathname.startsWith(item.to)}
            />
          ))}
        </nav>
        
        <div className="px-4 mt-auto">
          <button className="w-full flex items-center px-4 py-3 text-error hover:bg-red-50 rounded-md transition-colors">
            <span className="mr-3">🚪</span>
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border-color flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-text-main">
              {menuItems.find(i => location.pathname.startsWith(i.to))?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-text-main">Quản trị viên</p>
              <p className="text-xs text-text-secondary">admin@gamemarket.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary border border-blue-200">
              <UserCircle size={24} />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
