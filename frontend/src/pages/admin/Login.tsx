import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState<boolean>(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login(email, password);
            // Sau khi đăng nhập thành công, điều hướng về Dashboard
            navigate("/admin/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Email hoặc mật khẩu không chính xác.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-roboto">
            <div className="sm:mx-auto sm:w-full sm:max-w-[540px]">
                <h2 className="text-[28px] font-bold text-primary mb-6">Đăng nhập / Đăng ký</h2>
                
                <div className="bg-white shadow-md border border-[#E2E8F0] rounded-2xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-[#E2E8F0]">
                        <button 
                            className="flex-1 py-4 flex items-center justify-center gap-2 text-primary font-medium border-b-2 border-primary transition-all"
                            onClick={() => setIsActive(true)}
                        >
                            <LogIn size={20} />
                            Đăng nhập
                        </button>
                        <button 
                            className="flex-1 py-4 flex items-center justify-center text-[#64748B] font-medium hover:bg-slate-50 transition-all"
                            onClick={() => setIsActive(false)}
                        >
                            Đăng ký
                        </button>
                    </div>

                    <div className="p-6 sm:p-10">
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-xl flex items-center gap-3 animate-shake">
                                    <AlertCircle size={18} />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-[15px] font-medium text-[#1E293B] mb-2">
                                    Tài khoản của bạn (Email)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="Nhập địa chỉ Email"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-[15px] font-medium text-[#1E293B] mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-12 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="Nhập mật khẩu"
                                    />
                                    <button 
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-primary transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a22.79 22.79 0 0 1 2.1-3.18"></path><path d="M6.83 6.83A10.11 10.11 0 0 1 12 4c7 0 10 7 10 7a22.79 22.79 0 0 1-1.1 1.74"></path><line x1="1" y1="1" x2="23" y2="23"></line><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-5 w-5 text-primary focus:ring-primary/20 border-[#E2E8F0] rounded-md cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-[#64748B] cursor-pointer">
                                        Ghi nhớ đăng nhập
                                    </label>
                                </div>
                                <a href="#" className="text-sm font-medium text-primary hover:underline">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Đăng nhập"}
                            </button>
                        </form>

                        {/* Social Login */}
                        <div className="mt-8">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#E2E8F0]"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-[#94A3B8] font-medium">Hoặc đăng nhập với</span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-[#E2E8F0] hover:bg-slate-50 transition-all shadow-sm">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                                    </svg>
                                </button>
                                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-[#E2E8F0] hover:bg-slate-50 transition-all shadow-sm">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.03 4.39 11.02 10.12 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.44C19.61 23.09 24 18.1 24 12.07z" fill="#1877F2"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-[#64748B]">
                                    Chưa có tài khoản? <button type="button" className="text-primary font-bold hover:underline">Đăng ký ngay</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
