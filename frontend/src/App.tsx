import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import AuthPage from "./pages/admin/auth";
import GameManagementPage from "./pages/admin/games/GameManagement";
import AccountManagementPage from "./pages/admin/accounts/AccountManagement";
import OrderManagementPage from "./pages/admin/orders/OrderManagement";
import UserManagementPage from "./pages/admin/users/UserManagement";
import ManualDepositPage from "./pages/admin/deposits/ManualDeposit";
import CardManagementPage from "./pages/admin/deposits/CardManagement";
import DepositHistoryPage from "./pages/admin/deposits/DepositHistory";
import NewsManagementPage from "./pages/admin/news/NewsManagement";
import BannerManagementPage from "./pages/admin/banners/BannerManagement";
import TransactionManagementPage from "./pages/admin/transactions/TransactionManagement";
import DashboardPage from "./pages/admin/dashboard/Dashboard";
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

// Removed mock Dashboard
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
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="games" element={<GameManagementPage />} />
                        <Route path="accounts" element={<AccountManagementPage />} />
                        <Route path="orders" element={<OrderManagementPage />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="deposits" element={<Navigate to="/admin/deposits/manual" replace />} />
                        <Route path="deposits/manual" element={<ManualDepositPage />} />
                        <Route path="deposits/cards" element={<CardManagementPage />} />
                        <Route path="deposits/history" element={<DepositHistoryPage />} />
                        <Route path="news" element={<NewsManagementPage />} />
                        <Route path="banners" element={<BannerManagementPage />} />
                        <Route path="transactions" element={<TransactionManagementPage />} />
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
