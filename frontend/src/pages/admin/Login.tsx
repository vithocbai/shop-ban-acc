import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogIn, Mail, Lock, AlertCircle, Loader2, User, View, EyeOff, Eye } from "lucide-react";

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    // Thêm state để lưu lỗi validation cho từng trường
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    // Thêm state ẩn hiện mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Thêm state loading
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    // Mode
    const [mode, setMode] = useState<"login" | "register">("login");
    // Thêm state active Mode
    const [isActive, setIsActive] = useState<boolean>(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        // Cờ để kiểm tra nếu có lỗi validation nào không
        let isValid = true;

        const errorMessages: { [key: string]: string } = {};

        // Validate Username
        if (!username) {
            errorMessages.username = "Tên đăng nhập không được để trống.";
            setIsLoading(false);
            isValid = false;
        }

        // Validate Email
        if (!email) {
            errorMessages.email = "Email không được để trống.";
            setIsLoading(false);
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errorMessages.email = "Email không hợp lệ.";
            setIsLoading(false);
            isValid = false;
        }

        // Validate Password
        if (!password) {
            errorMessages.password = "Mật khẩu không được để trống.";
            setIsLoading(false);
            isValid = false;
        }

        // Validate confirm Password
        if (!confirmPassword) {
            errorMessages.confirmPassword = "Xác nhận mật khẩu không được để trống.";
            setIsLoading(false);
            isValid = false;
        } else if (confirmPassword !== password) {
            errorMessages.confirmPassword = "Mật khẩu không khớp.";
            setIsLoading(false);
            isValid = false;
        }

        setFieldErrors(errorMessages);
        if (!isValid) return;

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
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 font-roboto">
            <div className="sm:mx-auto sm:w-full sm:max-w-[540px]">
                <div className="bg-white shadow-md border border-[#E2E8F0] rounded-2xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-[#E2E8F0]">
                        <button
                            className={`flex-1 py-4 flex items-center justify-center gap-2 cursor-pointer transition-all
                              ${isActive ? "text-primary font-medium border-b-2 border-primary" : "text-[#64748B] font-medium hover:bg-slate-50"}`}
                            onClick={() => {
                                setIsActive(true);
                                setMode("login");
                            }}
                        >
                            <LogIn size={20} />
                            Đăng nhập
                        </button>
                        <button
                            className={`flex-1 py-4 flex items-center justify-center gap-2 cursor-pointer transition-all
                              ${!isActive ? "text-primary font-medium border-b-2 border-primary" : "text-[#64748B] font-medium hover:bg-slate-50"}`}
                            onClick={() => {
                                setIsActive(false);
                                setMode("register");
                            }}
                        >
                            Đăng ký
                        </button>
                    </div>

                    <div className="p-6 sm:p-8 min-h-[500px] flex flex-col">
                        <form className="space-y-1.5" onSubmit={handleSubmit} noValidate>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-xl flex items-center gap-3 animate-shake mb-4">
                                    <AlertCircle size={18} />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            {mode === "register" && (
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="block text-[14px] font-medium text-[#1E293B] mb-1.5"
                                    >
                                        Tên đăng nhập
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                                            <User size={18} />
                                        </div>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={`block w-full pl-11 pr-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 ${fieldErrors.username ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-[#E2E8F0] focus:ring-primary/20 focus:border-primary"}`}
                                            placeholder="Nhập tên đăng nhập"
                                        />
                                    </div>
                                    <div className="min-h-[20px]">
                                        {fieldErrors.username && (
                                            <p className="text-[12px] text-red-500 mt-0.5 italic">
                                                {fieldErrors.username}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-[14px] font-medium text-[#1E293B] mb-1.5">
                                    Tài khoản của bạn (Email)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`block w-full pl-11 pr-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 ${fieldErrors.email ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-[#E2E8F0] focus:ring-primary/20 focus:border-primary"}`}
                                        placeholder="Nhập địa chỉ Email"
                                    />
                                </div>
                                <div className="min-h-[20px]">
                                    {fieldErrors.email && (
                                        <p className="text-[12px] text-red-500 mt-0.5 italic">{fieldErrors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-[14px] font-medium text-[#1E293B] mb-1.5"
                                >
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? `text` : `password`}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`block w-full pl-11 pr-11 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 ${fieldErrors.password ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-[#E2E8F0] focus:ring-primary/20 focus:border-primary"}`}
                                        placeholder="Nhập mật khẩu"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-primary transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="min-h-[20px]">
                                    {fieldErrors.password && (
                                        <p className="text-[12px] text-red-500 mt-0.5 italic">{fieldErrors.password}</p>
                                    )}
                                </div>
                            </div>

                            {mode === "register" && (
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-[14px] font-medium text-[#1E293B] mb-1.5"
                                    >
                                        Nhập lại mật khẩu
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? `text` : `password`}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`block w-full pl-11 pr-11 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 ${fieldErrors.confirmPassword ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-[#E2E8F0] focus:ring-primary/20 focus:border-primary"}`}
                                            placeholder="Nhập lại mật khẩu"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-primary transition-colors"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div className="min-h-[20px]">
                                        {fieldErrors.confirmPassword && (
                                            <p className="text-[12px] text-red-500 mt-0.5 italic">
                                                {fieldErrors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-primary focus:ring-primary/20 border-[#E2E8F0] rounded cursor-pointer"
                                    />
                                    <label
                                        htmlFor="remember-me"
                                        className="ml-2 block text-sm text-[#64748B] cursor-pointer"
                                    >
                                        Ghi nhớ đăng nhập
                                    </label>
                                </div>
                                {mode === "login" && (
                                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                                        Quên mật khẩu?
                                    </a>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : mode === "login" ? (
                                    "Đăng nhập"
                                ) : (
                                    "Đăng ký ngay"
                                )}
                            </button>
                        </form>

                        <div className="mt-auto pt-8">
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
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 12-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                </button>
                                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-[#E2E8F0] hover:bg-slate-50 transition-all shadow-sm">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.03 4.39 11.02 10.12 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.44C19.61 23.09 24 18.1 24 12.07z"
                                            fill="#1877F2"
                                        />
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

export default AdminLogin;
