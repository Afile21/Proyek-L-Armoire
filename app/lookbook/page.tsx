"use client";
import { useState } from "react";
import Link from "next/link";

// Tipe data untuk item di lookbook
type Garment = {
    id: string;
    brand: string;
    category: string;
    image: string;
};

export default function Lookbook() {
    // State untuk menyimpan baju-baju yang dimasukkan ke kanvas
    const [canvasItems, setCanvasItems] = useState<Garment[]>([]);

    // Dummy data Lemari (Nantinya ditarik dari database PostgreSQL Anda)
    const wardrobe: Garment[] = [
        { id: "1", brand: "LEMAIRE", category: "TOP", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80" },
        { id: "2", brand: "ACNE STUDIOS", category: "BOTTOM", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80" },
        { id: "3", brand: "MAISON MARGIELA", category: "SHOES", image: "https://images.unsplash.com/photo-1591047139829-e91af226d122?auto=format&fit=crop&w=600&q=80" },
        { id: "4", brand: "JIL SANDER", category: "OUTERWEAR", image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=600&q=80" }
    ];

    // Fungsi untuk memindahkan baju ke kanvas
    const addToCanvas = (item: Garment) => {
        if (!canvasItems.find(i => i.id === item.id)) {
            setCanvasItems([...canvasItems, item]);
        }
    };

    // Fungsi untuk menghapus baju dari kanvas
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
                                <img src={item.image} alt={item.brand} className="w-full h-auto object-cover shadow-sm" />
                                {/* Overlay hapus saat di-hover */}
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Remove</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* AREA LEMARI / WARDROBE (KANAN) */}
                <div className="w-full md:w-1/3 bg-white border border-gray-200 p-6 flex flex-col">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-100 pb-4 mb-6">
                        Your Wardrobe
                    </h3>

                    <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[60vh] pr-2">
                        {wardrobe.map(item => (
                            <div
                                key={`wardrobe-${item.id}`}
                                className="cursor-pointer group relative"
                                onClick={() => addToCanvas(item)}
                            >
                                <img src={item.image} alt={item.brand} className="w-full aspect-[3/4] object-cover bg-gray-100 group-hover:opacity-50 transition-opacity" />
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