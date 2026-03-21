export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Container utama dengan gaya editorial */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">
          L&#39;Armoire
        </h1>
        <p className="text-sm md:text-base tracking-widest text-gray-500 uppercase">
          Personal Wardrobe & Investment System
        </p>
        
        {/* Tombol CTA (Call to Action) minimalis */}
        <div className="pt-8">
          <button className="border border-black bg-black text-white px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300">
            Enter Wardrobe
          </button>
        </div>
      </div>
    </main>
  );
}