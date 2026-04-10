import Link from "next/link";
import { prisma } from "@/app/utils/prisma";
import { notFound } from "next/navigation";
import LogWearButton from "@/app/components/LogWearButton";

// Import fungsi untuk mengecek sesi di server
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

// Ubah tipe params menjadi Promise
export default async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
    
    // Cek apakah pengguna saat ini sedang login
    const session = await getServerSession(authOptions);

    // 1. Await params terlebih dahulu sebelum mengambil id-nya
    const resolvedParams = await params;

    // 2. Ambil data item spesifik beserta relasi WearLogs dan Category (FASE 14)
    const item = await prisma.item.findUnique({
        where: { id: resolvedParams.id },
        include: { 
            wearLogs: true,
            category: true // [UPDATE FASE 14]
        }
    });

    // Jika ID tidak ditemukan di database, lemparkan ke halaman 404
    if (!item) {
        notFound();
    }

    // 3. Logika Format Harga & CPW (Cost Per Wear)
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

    // 4. Logika Kalkulasi Durasi Kepemilikan (Owned For)
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
                            {/* Brand diletakkan di atas dengan ukuran lebih kecil namun bold/tracking lebar */}
                            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">
                                {item.brand}
                            </h2>
                            
                            {/* Nama Item menjadi tajuk utama (H1) yang besar dan elegan */}
                            <h1 className="text-3xl md:text-5xl uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>
                                {item.name}
                            </h1>
                            
                            {/* [UPDATE FASE 14] Render nama dari relasi tabel Kategori */}
                            <p className="text-xs tracking-[0.3em] text-gray-400 mt-4">
                                CATEGORY: {item.category?.name}
                            </p>
                            <p className="text-xl mt-6 font-medium">
                                {formattedPrice}
                            </p>
                        </div>

                        {/* Tabel Atribut Database Asli */}
                        <div className="grid grid-cols-2 gap-y-8 text-[10px] md:text-xs uppercase tracking-widest border-y border-gray-100 py-8">
                            <div>
                                <span className="block text-gray-400 mb-1">Color</span>
                                <span>{item.base_color}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 mb-1">Size</span>
                                <span>{item.size}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 mb-1">Material</span>
                                <span>{item.material}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 mb-1">Season</span>
                                <span>{item.season.replace('_', ' ')}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 mb-1">Genre</span>
                                <span>{item.genre}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 mb-1">Status</span>
                                {/* Efek visual pudar jika pakaian tidak sedang aktif/bisa dipakai */}
                                <span className={item.status !== 'ACTIVE' ? 'text-gray-400 italic' : ''}>
                                    {item.status.replace('_', ' ')}
                                </span>
                            </div>
                            {/* --- [UPDATE FASE 14] Wash Instructions --- */}
                            <div className="col-span-2">
                                <span className="block text-gray-400 mb-1">Care & Wash Instructions</span>
                                <span>{item.wash_instructions || "SEE CARE LABEL"}</span>
                            </div>
                        </div>

                        {/* METRIK FINANSIAL: Kalkulator CPW Dinamis */}
                        <div className="bg-gray-50 p-6 md:p-8 border border-gray-100">
                            <h3 className="text-xs tracking-[0.2em] uppercase mb-8 font-bold border-b border-gray-200 pb-4">
                                Investment Metrics
                            </h3>
                            <div className="space-y-6 text-xs uppercase tracking-widest">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Owned For</span>
                                    <span>{ownedFor}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Total Wears</span>
                                    <span>{wearsCount} Times</span>
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

                        {/* Tombol Aksi Interaktif HANYA dirender jika ada sesi (user sudah login) */}
                        {session && (
                            <div className="space-y-4">
                                <LogWearButton itemId={item.id} />
                                
                                {/* --- [UPDATE FASE 14.3] Tombol Edit (Secondary Button) --- */}
                                <Link
                                    href={`/catalog/${resolvedParams.id}/edit`}
                                    className="flex w-full items-center justify-center border border-gray-200 bg-transparent text-gray-500 py-4 text-[10px] tracking-[0.2em] uppercase hover:border-black hover:text-black transition-colors duration-300"
                                >
                                    Edit Item
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}