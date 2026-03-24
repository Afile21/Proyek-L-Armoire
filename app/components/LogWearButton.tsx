"use client"; // Wajib untuk komponen yang memiliki interaktivitas (onClick)

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function LogWearButton({ itemId }: { itemId: string }) {
    // Memisahkan state fetch API dan state refresh UI
    const [isFetching, setIsFetching] = useState(false);
    const [isPending, startTransition] = useTransition(); 
    const router = useRouter();

    // Tombol akan disable jika sedang nge-fetch API ATAU sedang me-refresh halaman
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
                // PATCH: Membungkus router.refresh dengan startTransition
                // Ini mencegah tombol bisa diklik lagi sebelum data Prisma terbaru selesai dimuat
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
            className="w-full border border-black bg-black text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isMutating ? "Logging..." : "Log a Wear (Pakai Hari Ini)"}
        </button>
    );
}