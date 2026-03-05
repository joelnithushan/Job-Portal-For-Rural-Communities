import { Loader2 } from "lucide-react";

export const Spinner = ({ size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
    };

    return (
        <Loader2
            className={`animate-spin text-brand-terra ${sizeClasses[size] || sizeClasses.md} ${className}`}
        />
    );
};
