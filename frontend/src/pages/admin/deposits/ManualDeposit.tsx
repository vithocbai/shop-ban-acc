import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userService } from "@/features/user/services/user.service";
import { paymentService } from "@/features/payment/services/payment.service";
import { Loader2, Search, CheckCircle2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; // Assuming this exists or I will create it
import type { User } from "@/features/user/types";
import { toast } from "react-toastify";

export default function ManualDeposit() {
    type PaymentMethod = "BANK_TRANSFER" | "MOMO" | "CASH" | "OTHER";
    const paymentMethodLabels: Record<PaymentMethod, string> = {
        BANK_TRANSFER: "Chuyển khoản ngân hàng",
        MOMO: "MoMo",
        CASH: "Tiền mặt",
        OTHER: "Khác",
    };

    // Form state
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
    const [note, setNote] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search state
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!debouncedSearchTerm) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const response = await userService.getUsers({ search: debouncedSearchTerm, page: 1, page_size: 5 });
                setSearchResults(response.items || []);
            } catch (error) {
                console.error("Lỗi tìm kiếm người dùng", error);
            } finally {
                setIsSearching(false);
            }
        };

        fetchUsers();
    }, [debouncedSearchTerm]);

    const numericAmount = parseInt(amount.replace(/,/g, "")) || 0;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        if (!rawValue) {
            setAmount("");
            return;
        }
        const formattedValue = new Intl.NumberFormat("en-US").format(parseInt(rawValue, 10));
        setAmount(formattedValue);
    };

    const handleSubmit = async () => {
        if (!selectedUser) {
            toast.error("Vui lòng chọn người dùng");
            return;
        }
        if (numericAmount < 10000) {
            toast.error("Số tiền nạp tối thiểu là 10,000đ");
            return;
        }

        setIsSubmitting(true);
        try {
            await paymentService.manualDeposit({
                user_id: selectedUser.id,
                amount: numericAmount,
                payment_method: paymentMethod,
                note: note,
            });

            toast.success(
                `Nạp thành công ${new Intl.NumberFormat("vi-VN").format(numericAmount)}đ cho ${selectedUser.username || selectedUser.email}`,
            );

            // Reset form
            setSelectedUser(null);
            setSearchTerm("");
            setAmount("");
            setNote("");
        } catch (error: any) {
            toast.error(error.message || "Đã xảy ra lỗi khi nạp tiền");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Nạp tiền thủ công</h2>
                <p className="text-muted-foreground">Admin cộng trực tiếp số dư cho người dùng.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin giao dịch</CardTitle>
                        <CardDescription>Tìm người dùng và nhập số tiền cần nạp.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* User Search Combobox */}
                        <div className="space-y-2 relative">
                            <Label>Tìm người dùng</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Nhập email hoặc tên người dùng..."
                                    className="pl-9"
                                    value={selectedUser ? selectedUser.username || selectedUser.email : searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (selectedUser) setSelectedUser(null);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                />
                                {isSearching && (
                                    <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {showDropdown && searchResults.length > 0 && !selectedUser && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowDropdown(false);
                                                setSearchTerm("");
                                            }}
                                        >
                                            <span className="font-medium text-sm">{user.username || "Không tên"}</span>
                                            <span className="text-xs text-gray-500">{user.email}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Số tiền nạp (VNĐ)</Label>
                            <Input
                                type="text"
                                placeholder="Ví dụ: 100,000"
                                value={amount}
                                onChange={handleAmountChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Phương thức thanh toán</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn phương thức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BANK_TRANSFER">Chuyển khoản Ngân hàng</SelectItem>
                                    <SelectItem value="MOMO">Momo</SelectItem>
                                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                                    <SelectItem value="OTHER">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Ghi chú (Tùy chọn)</Label>
                            <Textarea
                                placeholder="Nhập ghi chú giao dịch, mã bill..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedUser || numericAmount < 10000}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Thực hiện nạp tiền
                        </Button>
                    </CardFooter>
                </Card>

                {/* Right Column: Preview */}
                <Card className="h-fit sticky top-4 bg-gray-50">
                    <CardHeader>
                        <CardTitle className="text-lg">Tóm tắt giao dịch</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Khách hàng:</span>
                            <span className="font-medium">
                                {selectedUser ? selectedUser.username || selectedUser.email : "Chưa chọn"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Số điện thoại:</span>
                            <span>{selectedUser?.phone || "---"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Số dư hiện tại:</span>
                            <span className="font-medium text-blue-600">
                                {selectedUser
                                    ? new Intl.NumberFormat("vi-VN").format(Number(selectedUser.balance || 0)) + " đ"
                                    : "---"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Phương thức:</span>
                            <span>{paymentMethodLabels[paymentMethod as PaymentMethod]}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Phí giao dịch:</span>
                            <span>0 đ</span>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <span className="text-lg font-bold">Thực nhận:</span>
                            <span className="text-2xl font-bold text-green-600">
                                +{new Intl.NumberFormat("vi-VN").format(numericAmount)} đ
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Số dư sau khi nạp:</span>
                            <span className="font-medium text-green-600">
                                {selectedUser
                                    ? new Intl.NumberFormat("vi-VN").format(
                                          Number(selectedUser.balance || 0) + numericAmount,
                                      ) + " đ"
                                    : "---"}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {selectedUser && numericAmount >= 10000 && (
                            <div className="w-full bg-green-100 text-green-800 p-3 rounded-md flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="text-sm font-medium">Giao dịch hợp lệ, sẵn sàng nạp.</span>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
