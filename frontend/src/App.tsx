import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';

// Mock Pages (Sẽ triển khai chi tiết sau)
const Dashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[
      { label: 'Tổng doanh thu', value: '150,000,000đ', color: 'text-success' },
      { label: 'Đơn hàng mới', value: '25', color: 'text-primary' },
      { label: 'Tài khoản đang bán', value: '1,240', color: 'text-warning' },
      { label: 'Người dùng mới', value: '12', color: 'text-text-main' },
    ].map((stat, i) => (
      <div key={i} className="card p-6">
        <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
      </div>
    ))}
  </div>
);

const GameManagement = () => (
  <div className="card">
    <div className="p-6 border-b border-border-color flex justify-between items-center">
      <h2 className="text-xl font-bold">Danh sách Game</h2>
      <button className="btn-primary">Thêm Game mới</button>
    </div>
    <div className="p-6">
      <p className="text-text-secondary text-center py-10">Đang tải danh sách game...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <path path="/admin" element={<AdminLayout children={<Dashboard />} />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="games" element={<GameManagement />} />
          <Route path="accounts" element={<div>Quản lý Tài khoản (Coming soon)</div>} />
          <Route path="orders" element={<div>Quản lý Đơn hàng (Coming soon)</div>} />
          <Route path="users" element={<div>Quản lý Người dùng (Coming soon)</div>} />
          <Route path="deposits" element={<div>Quản lý Nạp tiền (Coming soon)</div>} />
        </path>

        {/* Home Redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
