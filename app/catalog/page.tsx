import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Karena menggunakan Next.js App Router, ini adalah Server Component
// Kita bisa langsung mengambil data dari database di sini
export default async function Catalog() {
    
    // 1. Mengambil data ASLI dari database, diurutkan dari yang terbaru
    const items = await prisma.item.findMany({
        orderBy: { created_at: 'desc' }
    });

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

            {/* Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
                {items.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                        {/* Image Container */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-4">
                            {/* Gambar Utama (Karena di database bentuknya Array, kita ambil index ke-0) */}
                            <img
                                src={item.images[0]}
                                alt={item.brand}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                            />
                            {/* Gambar Saat di-hover (Sementara kita samakan dengan gambar utama) */}
                            <img
                                src={item.images[0]}
                                alt={`${item.brand} detail`}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100"
                            />
                        </div>

                        {/* Info Item */}
                        <div className="flex flex-col space-y-1 mt-2 text-[10px] md:text-xs uppercase tracking-[0.1em]">
                            {/* Menampilkan Nama Item dengan huruf tebal */}
                            <span className="font-bold">{item.name}</span> 
                            
                            {/* Menampilkan Brand dengan warna abu-abu agak gelap */}
                            <span className="text-gray-600">{item.brand}</span> 
                            
                            {/* Menampilkan Harga */}
                            <span className="text-gray-400">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}