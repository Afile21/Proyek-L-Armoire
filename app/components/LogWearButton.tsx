"use client"; // Wajib untuk komponen yang memiliki interaktivitas (onClick)

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogWearButton({ itemId }: { itemId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogWear = async () => {
        setIsLoading(true);
        try {
            // Memanggil API yang baru saja kita buat di Langkah 1
            const response = await fetch("/api/wearlogs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId }),
            });

            if (response.ok) {
                // Me-refresh halaman secara halus agar Server Component menarik data Prisma terbaru
                // Ini akan membuat angka "Total Wears" naik dan "Cost Per Wear" turun seketika!
                router.refresh();
            } else {
                console.error("Failed to log wear");
            }
        } catch (error) {
            console.error("Error logging wear:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handleLogWear}
            disabled={isLoading}
            className="w-full border border-black bg-black text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? "Logging..." : "Log a Wear (Pakai Hari Ini)"}
        </button>
    );
}