import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Mail, Lock, AlertCircle, Loader2, User, EyeOff, Eye } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { cn } from "../../../lib/utils";

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
                <Alert variant="destructive" className="mb-4 animate-shake">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium ml-2">{error}</AlertDescription>
                </Alert>
            )}

            <div>
                <Label htmlFor="username" className="mb-1.5 block">
                    Tên đăng nhập
                </Label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                        <User size={18} />
                    </div>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => handleInputChange("username", e.target.value, setUsername)}
                        className={cn("pl-11 pr-4 py-3 rounded-md", fieldErrors.username && "border-error focus-visible:ring-error")}
                        placeholder="Nhập tên đăng nhập"
                    />
                </div>
                <div className="min-h-[20px]">
                    {fieldErrors.username && (
                        <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.username}</p>
                    )}
                </div>
            </div>

            <div>
                <Label htmlFor="email" className="mb-1.5 block">
                    Tài khoản của bạn (Email)
                </Label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                        <Mail size={18} />
                    </div>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
                        className={cn("pl-11 pr-4 py-3 rounded-md", fieldErrors.email && "border-error focus-visible:ring-error")}
                        placeholder="Nhập địa chỉ Email"
                    />
                </div>
                <div className="min-h-[20px]">
                    {fieldErrors.email && (
                        <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.email}</p>
                    )}
                </div>
            </div>

            <div>
                <Label htmlFor="password" className="mb-1.5 block">
                    Mật khẩu
                </Label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                        <Lock size={18} />
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
                        className={cn("pl-11 pr-11 py-3 rounded-md", fieldErrors.password && "border-error focus-visible:ring-error")}
                        placeholder="Nhập mật khẩu"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="min-h-[20px]">
                    {fieldErrors.password && (
                        <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.password}</p>
                    )}
                </div>
            </div>

            <div>
                <Label htmlFor="confirmPassword" className="mb-1.5 block">
                    Nhập lại mật khẩu
                </Label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                        <Lock size={18} />
                    </div>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value, setConfirmPassword)}
                        className={cn("pl-11 pr-11 py-3 rounded-md", fieldErrors.confirmPassword && "border-error focus-visible:ring-error")}
                        placeholder="Nhập lại mật khẩu"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-primary transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="min-h-[20px]">
                    {fieldErrors.confirmPassword && (
                        <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.confirmPassword}</p>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 h-12 text-base font-bold rounded-md"
            >
                {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
                {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
            </Button>

            <div className="mt-4 text-center">
                <p className="text-sm text-text-secondary">
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
