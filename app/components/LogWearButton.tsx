"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { CalendarPlus, Loader2 } from "lucide-react";

export default function LogWearButton({ itemId }: { itemId: string }) {
    const [isFetching, setIsFetching] = useState(false);
    const [isPending, startTransition] = useTransition(); 
    const router = useRouter();

    const isMutating = isFetching || isPending;

    const handleLogWear = async () => {
        setIsFetching(true);
        try {
            const response = await fetch("/api/wearlogs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId }),
            });

            if (response.ok) {
                startTransition(() => {
                    router.refresh();
                });
            } else {
                console.error("Failed to log wear");
            }
        } catch (error) {
            console.error("Error logging wear:", error);
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <button 
            onClick={handleLogWear}
            disabled={isMutating}
            className="flex items-center justify-center gap-3 w-full border border-black bg-black text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Icon 
                icon={isMutating ? Loader2 : CalendarPlus} 
                size={14} 
                className={isMutating ? "animate-spin" : ""} 
                decorative={true} 
            />
            <span>{isMutating ? "Logging..." : "Log a Wear (Pakai Hari Ini)"}</span>
        </button>
    );
}