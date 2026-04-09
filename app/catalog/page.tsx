import { prisma } from "@/app/utils/prisma";
import Link from "next/link"; 
import AutoRefresh from "../components/AutoRefresh";
import Image from "next/image";

export default async function Catalog() {
    // 1. Mengambil data dari database, diurutkan dari yang terbaru
    // [UPDATE FASE 14] Include category untuk mengambil nama kategori
    const rawItems = await prisma.item.findMany({
        orderBy: { created_at: 'desc' },
        include: { category: true } 
    });

    // Normalisasi tipe data Decimal Prisma menjadi Number murni agar aman dirender
    const items = rawItems.map(item => ({
        ...item,
        price: Number(item.price)
    }));

    return (
        <main className="min-h-screen pt-28 px-4 md:px-8 pb-12">
            <AutoRefresh />
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
                            <Image
                                src={item.images[0] || '/fallback-assets/fallback.jpeg'}
                                alt={item.brand}
                                fill
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                            />
                            <Image
                                src={item.images[1] || item.images[0] || '/fallback-assets/fallback.jpeg'}
                                alt={`${item.brand} detail`}
                                fill
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100"
                            />
                        </div>

                        {/* Info Item */}
                        <div className="flex flex-col space-y-1 mt-3 text-[10px] md:text-xs uppercase tracking-widest">
                            <div className="flex justify-between items-start">
                                <span className="font-bold pr-2">{item.name}</span>
                                {/* Indikator visual editorial jika item tidak ACTIVE (misal: di laundry/rusak) */}
                                {item.status !== "ACTIVE" && (
                                    <span className="text-[8px] border border-gray-300 text-gray-500 px-1.5 py-0.5 whitespace-nowrap">
                                        {item.status}
                                    </span>
                                )}
                            </div>
                            
                            {/* [UPDATE FASE 14] Menambahkan Category Name berjejer dengan Brand & Genre */}
                            <span className="text-gray-600">
                                {item.category?.name} &bull; {item.brand} &bull; {item.genre}
                            </span> 
                            
                            <span className="text-gray-400">Rp {item.price.toLocaleString('id-ID')}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}