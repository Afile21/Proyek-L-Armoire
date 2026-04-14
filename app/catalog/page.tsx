import { prisma } from "@/app/utils/prisma";
import Link from "next/link"; 
import AutoRefresh from "../components/AutoRefresh";
import Image from "next/image";
import Icon from "../components/Icon";
import { Shirt, Tag } from "lucide-react";
import EmptyState from "../components/EmptyState";

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
                    className="flex items-center gap-4 text-3xl md:text-5xl uppercase tracking-tighter"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    <Icon icon={Shirt} size={36} strokeWidth={1} className="text-[#A3A3A3]" decorative={true} />
                    <span>Catalog</span>
                </h1>
                <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                    {items.length} Items
                </span>
            </div>

            {/* Jika kosong, panggil komponen EmptyState. Jika ada, render Grid Layout */}
            {items.length === 0 ? (
                <EmptyState 
                    title="Empty Catalog"
                    description="Your catalog has no entries. Add an item to start building your digital collection."
                    actionHref="/add"
                    actionLabel="Add New Item"
                />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
                    {items.map((item) => (
                        <Link href={`/catalog/${item.id}`} key={item.id} className="group cursor-pointer">
                            {/* Image Container */}
                            <div className="relative aspect-4/5 overflow-hidden bg-gray-50 mb-4">
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
                                    {item.status !== "ACTIVE" && (
                                        <span className="text-[8px] border border-gray-300 text-gray-500 px-1.5 py-0.5 whitespace-nowrap">
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                                
                                <span className="text-gray-600">
                                    {item.category?.name} &bull; {item.brand} &bull; {item.genre}
                                </span> 
                                
                                <span className="flex items-center gap-1.5 text-gray-400">
                                    <Icon icon={Tag} size={11} decorative={true} />
                                    Rp {item.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}