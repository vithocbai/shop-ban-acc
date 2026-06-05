import { useState } from "react";
import { Button } from "./button";
import { Check, Copy } from "lucide-react";


interface CopyButtonProps {
    value: string;
}

const CopyButton = ({ value }: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Copy thất bại", err);
        }
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    );
}

export default CopyButton;