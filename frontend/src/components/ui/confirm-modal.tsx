import React, { useState } from "react";
import { X, Loader2, AlertTriangle, Trash2, Info } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    description: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "primary";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Xác nhận",
    cancelText = "Hủy bỏ",
    variant = "danger",
}) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    const variantStyles = {
        danger: {
            icon: <Trash2 size={24} className="text-error" />,
            iconBg: "bg-error/10",
            button: "bg-error hover:bg-error/90 text-white",
        },
        warning: {
            icon: <AlertTriangle size={24} className="text-orange-500" />,
            iconBg: "bg-orange-100",
            button: "bg-orange-500 hover:bg-orange-600 text-white",
        },
        primary: {
            icon: <Info size={24} className="text-primary" />,
            iconBg: "bg-primary/10",
            button: "bg-primary hover:bg-primary/90 text-white",
        },
    };

    const { icon, iconBg, button } = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", iconBg)}>
                            {icon}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 text-text-secondary hover:bg-bg-secondary hover:text-text-main shrink-0"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                    
                    <h3 className="text-xl font-bold text-text-main mb-2">{title}</h3>
                    <div className="text-text-secondary text-sm">
                        {description}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50">
                    <Button type="button" variant="outline" onClick={onClose} className="font-bold px-5 bg-white">
                        {cancelText}
                    </Button>
                    <Button onClick={handleConfirm} disabled={isLoading} className={cn("font-bold px-6", button)}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" size={18} /> : null}
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};
