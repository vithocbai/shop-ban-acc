import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Mail, Lock, AlertCircle, Loader2, EyeOff, Eye } from "lucide-react";

interface LoginFormProps {
    onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        let isValid = true;
        const errorMessages: { [key: string]: string } = {};

        if (!email) {
            errorMessages.email = "Email không được để trống.";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errorMessages.email = "Email không hợp lệ.";
            isValid = false;
        }

        if (!password) {
            errorMessages.password = "Mật khẩu không được để trống.";
            isValid = false;
        }

        setFieldErrors(errorMessages);
        if (!isValid) {
            setIsLoading(false);
            return;
        }

        try {
            await login(email, password);
            navigate("/admin/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Email hoặc mật khẩu không chính xác.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string, setter: (val: string) => void) => {
        setter(value);
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <form className="space-y-1.5" onSubmit={handleSubmit} noValidate>
            {error && (
                <div className="bg-red-50 border border-red-200 text-error px-4 py-3 rounded-xl flex items-center gap-3 animate-shake mb-4">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
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
                        onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
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
                <label htmlFor="password" className="block text-[14px] font-medium text-[#1E293B] mb-1.5">
                    Mật khẩu
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                        <Lock size={18} />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
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

            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary/20 border-[#E2E8F0] rounded cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-[#64748B] cursor-pointer">
                        Ghi nhớ đăng nhập
                    </label>
                </div>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Quên mật khẩu?
                </a>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Đăng nhập"}
            </button>
            
            <div className="mt-4 text-center">
                <p className="text-sm text-[#64748B]">
                    Chưa có tài khoản?{" "}
                    <button 
                        type="button" 
                        onClick={onSwitchToRegister}
                        className="text-primary font-bold hover:underline"
                    >
                        Đăng ký ngay
                    </button>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;
