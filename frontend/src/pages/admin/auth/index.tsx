import React from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthPageProps {
    mode: "login" | "register";
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
    const navigate = useNavigate();
    const isActive = mode === "login";

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 font-roboto">
            <div className="sm:mx-auto sm:w-full sm:max-w-[540px]">
                <div className="bg-white shadow-md border border-[#E2E8F0] rounded-2xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-[#E2E8F0]">
                        <button
                            className={`flex-1 py-4 flex items-center justify-center gap-2 cursor-pointer transition-all
                              ${isActive ? "text-primary font-medium border-b-2 border-primary" : "text-[#64748B] font-medium hover:bg-slate-50"}`}
                            onClick={() => navigate("/admin/login")}
                        >
                            <LogIn size={20} />
                            Đăng nhập
                        </button>
                        <button
                            className={`flex-1 py-4 flex items-center justify-center gap-2 cursor-pointer transition-all
                              ${!isActive ? "text-primary font-medium border-b-2 border-primary" : "text-[#64748B] font-medium hover:bg-slate-50"}`}
                            onClick={() => navigate("/admin/register")}
                        >
                            <UserPlus size={20} />
                            Đăng ký
                        </button>
                    </div>

                    <div className="p-6 sm:p-8 min-h-[500px] flex flex-col">
                        {mode === "login" ? (
                            <LoginForm onSwitchToRegister={() => navigate("/admin/register")} />
                        ) : (
                            <RegisterForm onSwitchToLogin={() => navigate("/admin/login")} />
                        )}

                        {/* Social Login Shared Section */}
                        <div className="mt-auto pt-8">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#E2E8F0]"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-[#94A3B8] font-medium">Hoặc {mode === "login" ? "đăng nhập" : "đăng ký"} với</span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-[#E2E8F0] hover:bg-slate-50 transition-all shadow-sm">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                    </svg>
                                </button>
                                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-[#E2E8F0] hover:bg-slate-50 transition-all shadow-sm">
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
