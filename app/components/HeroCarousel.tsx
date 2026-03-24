"use client";

import { useState, useEffect } from "react";

export default function HeroCarousel({ mediaUrls }: { mediaUrls: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Hentikan timer jika asetnya hanya 1 atau kosong
        if (mediaUrls.length <= 1) return;

        // Aturan Blueprint 5.2: Memutar visual setiap 8 detik
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaUrls.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [mediaUrls.length]);

    return (
        <>
            {mediaUrls.map((url, index) => {
                // Deteksi format aset (Cloudinary biasanya menggunakan format ini untuk video)
                const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('/video/upload/');
                const isActive = index === currentIndex;

                return (
                    <div
                        key={url + index}
                        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out z-0 ${
                            isActive ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        {isVideo ? (
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src={url} type="video/mp4" />
                            </video>
                        ) : (
                            <img
                                src={url}
                                alt={`Hero campaign ${index}`}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
}