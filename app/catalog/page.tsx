export default function Catalog() {
    // Dummy data sementara untuk memvisualisasikan UI sebelum ada fungsi database
    const items = [
        {
            id: "1",
            brand: "MAISON MARGIELA",
            price: "Rp 12.500.000",
            img1: "https://images.unsplash.com/photo-1591047139829-e91af226d122?auto=format&fit=crop&w=800&q=80",
            img2: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: "2",
            brand: "ACNE STUDIOS",
            price: "Rp 5.200.000",
            img1: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
            img2: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: "3",
            brand: "JIL SANDER",
            price: "Rp 8.900.000",
            img1: "https://images.unsplash.com/photo-1572495641004-28421ae52e52?auto=format&fit=crop&w=800&q=80",
            img2: "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: "4",
            brand: "LEMAIRE",
            price: "Rp 7.100.000",
            img1: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
            img2: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
        }
    ];

    return (
        <main className="min-h-screen pt-28 px-4 md:px-8 pb-12">
            {/* Header Katalog */}
            <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-4">
                <h1
                    className="text-3xl md:text-5xl uppercase tracking-tighter"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Catalog
                </h1>
                <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                    {items.length} Items
                </span>
            </div>

            {/* Grid Layout: 2 kolom di HP, 4 kolom di Desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
                {items.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                        {/* Image Container dengan rasio portrait 4:5 */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-4">
                            {/* Gambar Utama */}
                            <img
                                src={item.img1}
                                alt={item.brand}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                            />
                            {/* Gambar Kedua (Muncul secara perlahan saat mouse di-hover) */}
                            <img
                                src={item.img2}
                                alt={`${item.brand} detail`}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100"
                            />
                        </div>

                        {/* Info Item (Hanya Merek dan Harga) */}
                        <div className="flex flex-col space-y-1 mt-2 text-[10px] md:text-xs uppercase tracking-[0.1em]">
                            <span className="font-bold">{item.brand}</span>
                            <span className="text-gray-500">{item.price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}