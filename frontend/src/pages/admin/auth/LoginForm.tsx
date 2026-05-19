import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Mail, Lock, AlertCircle, Loader2, EyeOff, Eye } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { cn } from "../../../lib/utils";

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
                <Alert variant="destructive" className="mb-4 animate-shake">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium ml-2">{error}</AlertDescription>
                </Alert>
            )}

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

            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary/20 border-border-color rounded cursor-pointer"
                    />
                    <Label htmlFor="remember-me" className="ml-2 text-text-secondary cursor-pointer font-normal">
                        Ghi nhớ đăng nhập
                    </Label>
                </div>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Quên mật khẩu?
                </a>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 h-12 text-base font-bold rounded-md"
            >
                {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
            
            <div className="mt-4 text-center">
                <p className="text-sm text-text-secondary">
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
