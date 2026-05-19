import React, { useState, useEffect } from "react";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthPageProps {
    mode: "login" | "register";
    isAdminPage?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, isAdminPage = false }) => {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();
    const [authError, setAuthError] = useState<string | null>(null);
    const isActive = mode === "login";

    useEffect(() => {
        // Nếu là trang Admin mà user login vào là user thường
        if (user && isAdminPage && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
            setAuthError("Bạn không có quyền truy cập trang quản trị. Vui lòng đăng nhập tài khoản Admin.");
            // Logout để họ có thể login lại bằng acc admin
            logout();
        }
    }, [user, isAdminPage, logout]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    // Nếu đã đăng nhập thành công và đúng quyền hạn
    if (user && !authError) {
        if (isAdminPage) {
            if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
                return <Navigate to="/admin/dashboard" replace />;
            }
        } else {
            // Trang public thì về Home
            return <Navigate to="/" replace />;
        }
    }

    const handleNavigate = (newMode: "login" | "register") => {
        const path = isAdminPage ? `/admin/${newMode}` : `/${newMode}`;
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-bg-secondary flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 font-roboto">
            <div className="sm:mx-auto sm:w-full sm:max-w-[540px]">
                <div className="bg-white shadow-md border border-border-color rounded-2xl overflow-hidden">
                    {/* Header Admin vs Public */}
                    <div className="bg-bg-secondary px-6 py-4 border-b border-border-color text-center">
                        <h2 className="text-xl font-bold text-text-main">
                            {isAdminPage ? "HỆ THỐNG QUẢN TRỊ" : "HỆ THỐNG SHOP ACC"}
                        </h2>
                        <p className="text-sm text-text-secondary">
                            {isAdminPage ? "Vui lòng đăng nhập tài khoản quản lý" : "Chào mừng bạn đến với hệ thống của chúng tôi"}
                        </p>
                    </div>

                    {/* Tạm thời không cần thiết */}
                    {/* Tabs */}
                    {/* <div className="flex border-b border-border-color">
                        <button
                            className={`flex-1 py-4 flex items-center justify-center gap-2 cursor-pointer transition-all
                              ${isActive ? "text-primary font-medium border-b-2 border-primary" : "text-text-secondary font-medium hover:bg-bg-secondary"}`}
                            onClick={() => handleNavigate("login")}
                        >
                            <LogIn size={20} />
                            Đăng nhập
                        </button>
                        <button
                            className={`flex-1 py-4 flex items-center justify-center gap-2 cursor-pointer transition-all
                              ${!isActive ? "text-primary font-medium border-b-2 border-primary" : "text-text-secondary font-medium hover:bg-bg-secondary"}`}
                            onClick={() => handleNavigate("register")}
                        >
                            <UserPlus size={20} />
                            Đăng ký
                        </button>
                    </div> */}

                    <div className="p-6 sm:p-8 min-h-[500px] flex flex-col">
                        {authError && (
                            <Alert variant="destructive" className="mb-6 animate-shake">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="font-medium ml-2">{authError}</AlertDescription>
                            </Alert>
                        )}

                        {mode === "login" ? (
                            <LoginForm onSwitchToRegister={() => handleNavigate("register")} />
                        ) : (
                            <RegisterForm onSwitchToLogin={() => handleNavigate("login")} />
                        )}

                        {/* Social Login Shared Section */}
                        <div className="mt-auto pt-8">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border-color"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-text-secondary font-medium">Hoặc đăng nhập với</span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-border-color hover:bg-bg-secondary transition-all shadow-sm">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                    </svg>
                                </button>
                                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-border-color hover:bg-bg-secondary transition-all shadow-sm">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.03 4.39 11.02 10.12 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.44C19.61 23.09 24 18.1 24 12.07z" fill="#1877F2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
