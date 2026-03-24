import { PrismaClient } from "@prisma/client";
import Link from "next/link"; // Tambahkan import Link

// --- TAMBAHKAN BARIS INI (DI BAWAH IMPORT, DI ATAS PRISMA CLIENT) ---
// PATCH: Memastikan katalog selalu mengambil data terbaru dari database (menghindari stale cache)
export const dynamic = "force-dynamic";
// -------------------------------------------------------------------

const prisma = new PrismaClient();

export default async function Catalog() {
    // 1. Mengambil data dari database, diurutkan dari yang terbaru
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
                    // 2. Ubah div menjadi Link untuk routing dinamis ke detail page
                    <Link href={`/catalog/${item.id}`} key={item.id} className="group cursor-pointer">
                        {/* Image Container */}
                        <div className="relative aspect-4/5 overflow-hidden bg-gray-50 mb-4">
                            {/* Menangani jika gambar kosong dengan fallback */}
                            <img
                                src={item.images[0] || '/fallback-assets/fallback.jpeg'}
                                alt={item.brand}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                            />
                            <img
                                src={item.images[1] || item.images[0] || '/fallback-assets/fallback.jpeg'}
                                alt={`${item.brand} detail`}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100"
                            />
                        </div>

                        {/* Info Item */}
                        <div className="flex flex-col space-y-1 mt-2 text-[10px] md:text-xs uppercase tracking-widest">
                            <span className="font-bold">{item.name}</span> 
                            <span className="text-gray-600">{item.brand}</span> 
                            {/* Konversi tipe Decimal Prisma ke Number untuk format Rupiah */}
                            <span className="text-gray-400">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}