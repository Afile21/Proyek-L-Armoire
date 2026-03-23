"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Tipe data disesuaikan dengan skema Prisma Database kita
type Garment = {
    id: string;
    name: string;
    brand: string;
    category: string;
    images: string[]; // Karena di database ini adalah array URL
};

export default function Lookbook() {
    const [canvasItems, setCanvasItems] = useState<Garment[]>([]);
    
    // State baru untuk data dinamis dan loading
    const [wardrobe, setWardrobe] = useState<Garment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mengambil data asli dari database PostgreSQL saat halaman dimuat
    useEffect(() => {
        const fetchWardrobe = async () => {
            try {
                const res = await fetch("/api/items");
                if (res.ok) {
                    const data = await res.json();
                    setWardrobe(data);
                }
            } catch (error) {
                console.error("Gagal mengambil data lemari:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWardrobe();
    }, []);

    const addToCanvas = (item: Garment) => {
        if (!canvasItems.find(i => i.id === item.id)) {
            setCanvasItems([...canvasItems, item]);
        }
    };

    const removeFromCanvas = (id: string) => {
        setCanvasItems(canvasItems.filter(i => i.id !== id));
    };

    return (
        <main className="min-h-screen pt-28 px-4 md:px-8 pb-20 flex flex-col">
            <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-4">
                <h1 className="text-4xl md:text-5xl uppercase tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Lookbook Canvas
                </h1>
                <button
                    onClick={() => setCanvasItems([])}
                    className="text-[10px] tracking-[0.2em] text-gray-400 hover:text-black uppercase transition-colors"
                >
                    Clear Canvas [X]
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 flex-grow">
                {/* AREA KANVAS (KIRI) */}
                <div className="w-full md:w-2/3 min-h-[60vh] bg-gray-50 border border-gray-200 p-8 flex flex-wrap gap-4 items-center justify-center relative">
                    {canvasItems.length === 0 ? (
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                            Select items from wardrobe to build an outfit
                        </p>
                    ) : (
                        canvasItems.map(item => (
                            <div key={`canvas-${item.id}`} className="relative group cursor-pointer w-40 md:w-56" onClick={() => removeFromCanvas(item.id)}>
                                {/* Menampilkan gambar pertama dari array images */}
                                <img src={item.images[0]} alt={item.name} className="w-full h-auto object-cover shadow-sm" />
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Remove</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* AREA LEMARI / WARDROBE (KANAN) */}
                <div className="w-full md:w-1/3 bg-white border border-gray-200 p-6 flex flex-col">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-100 pb-4 mb-6 flex justify-between">
                        <span>Your Wardrobe</span>
                        {isLoading && <span className="text-gray-400 animate-pulse">Loading...</span>}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[60vh] pr-2">
                        {!isLoading && wardrobe.length === 0 && (
                            <div className="col-span-2 text-center pt-10 text-[10px] text-gray-400 uppercase tracking-widest">
                                Wardrobe is empty. <br/> Add items first.
                            </div>
                        )}
                        {wardrobe.map(item => (
                            <div
                                key={`wardrobe-${item.id}`}
                                className="cursor-pointer group relative"
                                onClick={() => addToCanvas(item)}
                            >
                                {/* Menggunakan data gambar dari database */}
                                <img src={item.images[0] || "/placeholder.jpg"} alt={item.name} className="w-full aspect-[3/4] object-cover bg-gray-100 group-hover:opacity-50 transition-opacity" />
                                <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 text-[8px] uppercase tracking-wider text-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    + Add to Canvas
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button className="w-full border border-black bg-black text-white py-3 text-[10px] tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors">
                            Save Outfit
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}