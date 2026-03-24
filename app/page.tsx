import Link from "next/link";
import { v2 as cloudinary } from "cloudinary";
import HeroCarousel from "./components/HeroCarousel";

// Pastikan data aset selalu terbaru tanpa perlu re-build
export const dynamic = "force-dynamic";

// Konfigurasi Cloudinary SDK
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function Home() {
    let displayMedia: string[] = [];

    try {
        // Menggunakan Cloudinary Search API untuk mencari file ber-tag 'hero-display'
        const result = await cloudinary.search
            .expression('tags:hero-display')
            .sort_by('created_at', 'desc')
            .max_results(5)
            .execute();

        // Ekstrak URL aman dari hasil pencarian
        displayMedia = result.resources.map((res: { secure_url: string }) => res.secure_url);
    } catch (error) {
        console.error("Gagal mengambil aset dari Cloudinary:", error);
    }

    // Fallback yang elegan jika Anda belum memberi tag aset apa pun di Cloudinary
    if (displayMedia.length === 0) {
        displayMedia = [
            "https://videos.pexels.com/video-files/3205827/3205827-uhd_2560_1440_25fps.mp4"
        ];
    }

    return (
        <main className="relative w-full h-screen overflow-hidden bg-black">
            
            {/* Memanggil Carousel Visual */}
            <HeroCarousel mediaUrls={displayMedia} />

            {/* Overlay gelap agar tipografi tetap terbaca */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10 pointer-events-none"></div>
            

            {/* Konten Utama */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center text-center px-4">
                <h1
                    className="text-white text-5xl md:text-8xl font-bold tracking-tighter uppercase mb-6"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    L&#39;Armoire
                </h1>
                <p className="text-white/80 text-xs md:text-sm tracking-[0.4em] uppercase mb-12">
                    Autumn / Winter Archive
                </p>

                <Link
                    href="/catalog"
                    className="inline-block border border-white/50 bg-transparent text-white px-10 py-4 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-sm"
                >
                    Enter Wardrobe
                </Link>
            </div>
        </main>
    );
}