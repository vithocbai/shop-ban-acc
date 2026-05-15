import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Mail, Lock, AlertCircle, Loader2, User, EyeOff, Eye } from "lucide-react";

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        let isValid = true;
        const errorMessages: { [key: string]: string } = {};

        if (!username) {
            errorMessages.username = "Tên đăng nhập không được để trống.";
            isValid = false;
        }

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

        if (!confirmPassword) {
            errorMessages.confirmPassword = "Xác nhận mật khẩu không được để trống.";
            isValid = false;
        } else if (confirmPassword !== password) {
            errorMessages.confirmPassword = "Mật khẩu không khớp.";
            isValid = false;
        }

        setFieldErrors(errorMessages);
        if (!isValid) {
            setIsLoading(false);
            return;
        }

        try {
            await register(username, email, password, confirmPassword);
            // Sau khi đăng ký thành công, thường chuyển về login hoặc thông báo
            alert("Đăng ký thành công! Hãy đăng nhập.");
            onSwitchToLogin();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Đăng ký thất bại. Vui lòng thử lại.");
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
                <label htmlFor="username" className="block text-[14px] font-medium text-[#1E293B] mb-1.5">
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
                        onChange={(e) => handleInputChange("username", e.target.value, setUsername)}
                        className={`block w-full pl-11 pr-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 ${fieldErrors.username ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-[#E2E8F0] focus:ring-primary/20 focus:border-primary"}`}
                        placeholder="Nhập tên đăng nhập"
                    />
                </div>
                <div className="min-h-[20px]">
                    {fieldErrors.username && (
                        <p className="text-[12px] text-red-500 mt-0.5 italic">{fieldErrors.username}</p>
                    )}
                </div>
            </div>

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

            <div>
                <label htmlFor="confirmPassword" className="block text-[14px] font-medium text-[#1E293B] mb-1.5">
                    Nhập lại mật khẩu
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                        <Lock size={18} />
                    </div>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value, setConfirmPassword)}
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
                        <p className="text-[12px] text-red-500 mt-0.5 italic">{fieldErrors.confirmPassword}</p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Đăng ký ngay"}
            </button>

            <div className="mt-4 text-center">
                <p className="text-sm text-[#64748B]">
                    Đã có tài khoản?{" "}
                    <button 
                        type="button" 
                        onClick={onSwitchToLogin}
                        className="text-primary font-bold hover:underline"
                    >
                        Đăng nhập ngay
                    </button>
                </p>
            </div>
        </form>
    );
};

export default RegisterForm;
