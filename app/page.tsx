import Link from "next/link";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://videos.pexels.com/video-files/3205827/3205827-uhd_2560_1440_25fps.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Gelap Transparan agar teks lebih mudah dibaca */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-10 pointer-events-none"></div>

      {/* Konten Overlay Tengah (Z-index lebih tinggi agar di atas video) */}
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

        {/* PERBAIKAN: Mengubah <button> menjadi <Link> menuju /catalog */}
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