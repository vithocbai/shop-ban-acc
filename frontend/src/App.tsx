import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import AuthPage from "./pages/admin/auth";
import GameManagementPage from "./pages/admin/GameManagement";
import AccountManagementPage from "./pages/admin/AccountManagement";
import OrderManagementPage from "./pages/admin/OrderManagement";
import UserManagementPage from "./pages/admin/UserManagement";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};

// Mock Pages
const Dashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: "Tổng doanh thu", value: "150,000,000đ", color: "text-success" },
            { label: "Đơn hàng mới", value: "25", color: "text-primary" },
            { label: "Tài khoản đang bán", value: "1,240", color: "text-warning" },
            { label: "Người dùng mới", value: "12", color: "text-text-main" },
        ].map((stat, i) => (
            <div key={i} className="card p-6">
                <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
        ))}
    </div>
);



function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Auth Routes (For Users) */}
                    <Route path="/login" element={<AuthPage mode="login" />} />
                    <Route path="/register" element={<AuthPage mode="register" />} />

                    {/* Admin Auth Routes (For Admins) */}
                    <Route path="/admin/login" element={<AuthPage mode="login" isAdminPage={true} />} />
                    <Route path="/admin/register" element={<AuthPage mode="register" isAdminPage={true} />} />

                    {/* Admin Routes (Protected) */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="games" element={<GameManagementPage />} />
                        <Route path="accounts" element={<AccountManagementPage />} />
                        <Route path="orders" element={<OrderManagementPage />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="deposits" element={<div>Quản lý Nạp tiền (Coming soon)</div>} />
                    </Route>

                    {/* Home Redirect / Landing Page */}
                    <Route path="/" element={<div className="p-10 text-center"><h1>Chào mừng đến với Shop Acc Game</h1><p>Giao diện người dùng đang phát triển...</p><a href="/login" className="text-primary underline">Đăng nhập ngay</a></div>} />
                </Routes>
            </Router>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </AuthProvider>
    );
}

export default App;
