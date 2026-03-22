import Link from "next/link";

// Halaman Rute Dinamis (Dynamic Route) di Next.js
export default function ItemDetail() {
    // Dummy Data (Nantinya data ini ditarik dari database PostgreSQL menggunakan Prisma)
    const item = {
        brand: "MAISON MARGIELA",
        category: "OUTERWEAR",
        price: 12500000,
        formattedPrice: "Rp 12.500.000",
        images: [
            "https://images.unsplash.com/photo-1591047139829-e91af226d122?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1200&q=80"
        ],
        attributes: {
            color: "BLACK",
            size: "42 (IT)",
            material: "100% WOOL",
            season: "AUTUMN / WINTER",
            status: "ACTIVE"
        },
        stats: {
            ownedFor: "1 Year 2 Months",
            wears: 25, // Bayangkan pengguna sudah menekan tombol "Saya pakai baju ini hari ini" sebanyak 25 kali
        }
    };

    // Logika Kalkulator CPW: Harga dibagi jumlah pemakaian
    const cpw = Math.round(item.price / item.stats.wears);
    const formattedCpw = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(cpw);

    return (
        <main className="min-h-screen pt-28 px-4 md:px-8 pb-20">
            {/* Tombol Kembali */}
            <Link href="/catalog" className="text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors mb-12 block">
                &larr; Back to Catalog
            </Link>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                {/* Kolom Kiri: Galeri Foto Bergaya Editorial */}
                <div className="w-full md:w-1/2 space-y-4">
                    {item.images.map((img, index) => (
                        <img key={index} src={img} alt="Detail" className="w-full h-auto bg-gray-50 object-cover" />
                    ))}
                </div>

                {/* Kolom Kanan: Detail & Kalkulator CPW (Dibuat 'Sticky' agar tetap di layar saat di-scroll) */}
                <div className="w-full md:w-1/2 relative">
                    <div className="md:sticky md:top-32 space-y-12">

                        {/* Header Info */}
                        <div>
                            <h1 className="text-4xl md:text-5xl uppercase tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
                                {item.brand}
                            </h1>
                            <p className="text-xs tracking-[0.3em] text-gray-500 mt-4">{item.category}</p>
                            <p className="text-xl mt-6">{item.formattedPrice}</p>
                        </div>

                        {/* Tabel Atribut (Warna, Ukuran, dll) */}
                        <div className="grid grid-cols-2 gap-y-8 text-[10px] md:text-xs uppercase tracking-[0.1em] border-y border-gray-100 py-8">
                            <div>
                                <span className="block text-gray-400 mb-1">Color</span>
                                <span>{item.attributes.color}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 mb-1">Size</span>
                                <span>{item.attributes.size}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 mb-1">Material</span>
                                <span>{item.attributes.material}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 mb-1">Season</span>
                                <span>{item.attributes.season}</span>
                            </div>
                        </div>

                        {/* METRIK FINANSIAL: Kalkulator CPW */}
                        <div className="bg-gray-50 p-6 md:p-8 border border-gray-100">
                            <h3 className="text-xs tracking-[0.2em] uppercase mb-8 font-bold border-b border-gray-200 pb-4">
                                Investment Metrics
                            </h3>
                            <div className="space-y-6 text-xs uppercase tracking-[0.1em]">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Owned For</span>
                                    <span>{item.stats.ownedFor}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Total Wears</span>
                                    <span>{item.stats.wears} Times</span>
                                </div>

                                {/* Hasil CPW */}
                                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                                    <span className="font-bold">Cost Per Wear</span>
                                    <span className="text-lg font-bold bg-black text-white px-3 py-1">
                                        {formattedCpw}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Aksi dummy */}
                        <button className="w-full border border-black bg-black text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300">
                            Log a Wear (Pakai Hari Ini)
                        </button>

                    </div>
                </div>
            </div>
        </main>
    );
}