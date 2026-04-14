import Link from "next/link";
import { prisma } from "@/app/utils/prisma";
import { notFound } from "next/navigation";
import LogWearButton from "@/app/components/LogWearButton";
import DeleteItemButton from "@/app/components/DeleteItemButton";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

// Import Icon System
import Icon from "@/app/components/Icon";
import { 
    Award, Layers, Tag, Palette, Ruler, Scissors, 
    CloudSun, Activity, CalendarDays, Hash, Calculator, PenLine 
} from "lucide-react";

export default async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;

    const item = await prisma.item.findUnique({
        where: { id: resolvedParams.id },
        include: { 
            wearLogs: true,
            category: true 
        }
    });

    if (!item) {
        notFound();
    }

    const priceNumber = Number(item.price);
    const wearsCount = item.wearLogs.length;
    const cpw = wearsCount > 0 ? Math.round(priceNumber / wearsCount) : priceNumber;

    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(priceNumber);

    const formattedCpw = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(cpw);

    const purchaseDate = new Date(item.purchase_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - purchaseDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let ownedFor = "";
    if (years > 0) ownedFor += `${years} Year${years > 1 ? 's' : ''} `;
    if (remainingMonths > 0) ownedFor += `${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;
    if (years === 0 && remainingMonths === 0) ownedFor = `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
    if (diffDays === 0) ownedFor = "Purchased Today";

    return (
        <main className="min-h-screen pt-28 px-4 md:px-8 pb-20">
            <Link href="/catalog" className="text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors mb-12 block">
                &larr; Back to Catalog
            </Link>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                {/* Kolom Kiri: Galeri Foto */}
                <div className="w-full md:w-1/2 space-y-4">
                    {item.images.length > 0 ? (
                        item.images.map((img, index) => (
                            <img key={index} src={img} alt={`${item.name} detail`} className="w-full h-auto bg-gray-50 object-cover" />
                        ))
                    ) : (
                        <img src="/fallback-assets/fallback.jpeg" alt="No image available" className="w-full h-auto bg-gray-50 object-cover" />
                    )}
                </div>

                {/* Kolom Kanan: Detail & Kalkulator CPW */}
                <div className="w-full md:w-1/2 relative">
                    <div className="md:sticky md:top-32 space-y-12">

                        {/* Header Info */}
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">
                                <Icon icon={Award} size={14} decorative={true} />
                                <span>{item.brand}</span>
                            </h2>
                            
                            <h1 className="text-3xl md:text-5xl uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>
                                {item.name}
                            </h1>
                            
                            <p className="flex items-center gap-2 text-xs tracking-[0.3em] text-gray-400 mt-4">
                                <Icon icon={Layers} size={12} decorative={true} />
                                <span>CATEGORY: {item.category?.name}</span>
                            </p>
                            <p className="flex items-center gap-2 text-xl mt-6 font-medium">
                                <Icon icon={Tag} size={20} decorative={true} />
                                <span>{formattedPrice}</span>
                            </p>
                        </div>

                        {/* Tabel Atribut Database Asli */}
                        <div className="grid grid-cols-2 gap-y-8 text-[10px] md:text-xs uppercase tracking-widest border-y border-gray-100 py-8">
                            <div>
                                <span className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    <Icon icon={Palette} size={12} decorative={true} /> Color
                                </span>
                                <span>{item.base_color}</span>
                            </div>
                            <div>
                                <span className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    <Icon icon={Ruler} size={12} decorative={true} /> Size
                                </span>
                                <span>{item.size}</span>
                            </div>
                            <div>
                                <span className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    <Icon icon={Scissors} size={12} decorative={true} /> Material
                                </span>
                                <span>{item.material}</span>
                            </div>
                            <div>
                                <span className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    <Icon icon={CloudSun} size={12} decorative={true} /> Season
                                </span>
                                <span>{item.season.replace('_', ' ')}</span>
                            </div>
                            <div>
                                <span className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    <Icon icon={Layers} size={12} decorative={true} /> Genre
                                </span>
                                <span>{item.genre}</span>
                            </div>
                            <div>
                                <span className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    <Icon icon={Activity} size={12} decorative={true} /> Status
                                </span>
                                <span className={item.status !== 'ACTIVE' ? 'text-gray-400 italic' : ''}>
                                    {item.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    <Icon icon={Activity} size={12} decorative={true} /> Care & Wash Instructions
                                </span>
                                <span>{item.wash_instructions || "SEE CARE LABEL"}</span>
                            </div>
                        </div>

                        {/* METRIK FINANSIAL */}
                        <div className="bg-gray-50 p-6 md:p-8 border border-gray-100">
                            <h3 className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase mb-8 font-bold border-b border-gray-200 pb-4">
                                <Icon icon={Calculator} size={14} decorative={true} />
                                <span>Investment Metrics</span>
                            </h3>
                            <div className="space-y-6 text-xs uppercase tracking-widest">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-gray-400">
                                        <Icon icon={CalendarDays} size={12} decorative={true} /> Owned For
                                    </span>
                                    <span>{ownedFor}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-gray-400">
                                        <Icon icon={Hash} size={12} decorative={true} /> Total Wears
                                    </span>
                                    <span>{wearsCount} Times</span>
                                </div>
                                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                                    <span className="font-bold">Cost Per Wear</span>
                                    <span className="text-lg font-bold bg-black text-white px-3 py-1">
                                        {formattedCpw}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Aksi Interaktif */}
                        {session && (
                            <div className="space-y-4 pt-4 border-t border-gray-100 mt-8">
                                <LogWearButton itemId={item.id} />
                                
                                <div className="flex flex-row w-full gap-4">
                                    <Link
                                        href={`/catalog/${resolvedParams.id}/edit`}
                                        className="flex flex-1 items-center justify-center gap-3 border border-gray-200 bg-transparent text-gray-500 py-4 text-[10px] tracking-[0.2em] uppercase hover:border-black hover:text-black transition-colors duration-300"
                                    >
                                        <Icon icon={PenLine} size={14} decorative={true} />
                                        <span>Edit Item</span>
                                    </Link>
                                    
                                    <div className="flex flex-1">
                                        <DeleteItemButton itemId={item.id} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}