// src/components/BackButton.tsx
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex cursor-pointer items-center gap-2 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md px-3 py-1.5"
            >
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Back</span>
            </Button>
        </div>
    );
}
