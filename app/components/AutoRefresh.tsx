"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh() {
    const router = useRouter();

    useEffect(() => {
        // Membuka saluran komunikasi dengan nama yang sama persis
        const channel = new BroadcastChannel("catalog_channel");

        // Mendengarkan pesan yang masuk
        channel.onmessage = (event) => {
            // Jika pesan yang diterima adalah "DATA_CHANGED"
            if (event.data?.type === "DATA_CHANGED") {
                router.refresh(); // Perbarui data di background
            }
        };

        // Refresh otomatis saat pengguna kembali fokus ke tab ini
        const handleFocus = () => {
            router.refresh();
        };

        window.addEventListener("focus", handleFocus);

        // Membersihkan event saat pengguna pindah/tutup halaman
        return () => {
            channel.close();
            window.removeEventListener("focus", handleFocus);
        };
    }, [router]);

    return null; // Komponen ini tidak menampilkan apapun di layar (invisible)
}