"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "../components/Icon";
import { Sparkles, X, Plus, Save, ArchiveX, Loader2 } from "lucide-react";

// Tipe data disesuaikan dengan skema Prisma Database kita
type Garment = {
    id: string;
    name: string;
    brand: string;
    category: string;
    images: string[];
};

export default function Lookbook() {
    const [canvasItems, setCanvasItems] = useState<Garment[]>([]);
    const [wardrobe, setWardrobe] = useState<Garment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                <h1 className="flex items-center gap-4 text-4xl md:text-5xl uppercase tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
                    <Icon icon={Sparkles} size={36} strokeWidth={1} className="text-[#A3A3A3]" decorative={true} />
                    Lookbook Canvas
                </h1>
                <button
                    onClick={() => setCanvasItems([])}
                    className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-gray-400 hover:text-black uppercase transition-colors"
                >
                    <span>Clear Canvas</span>
                    <Icon icon={X} size={12} decorative={true} />
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 flex-grow">
                {/* AREA KANVAS (KIRI) */}
                <div className="w-full md:w-2/3 min-h-[60vh] bg-gray-50 border border-gray-200 p-8 flex flex-wrap gap-4 items-center justify-center relative">
                    {canvasItems.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 text-gray-400">
                            <Icon icon={Sparkles} size={32} strokeWidth={1} decorative={true} />
                            <p className="text-xs uppercase tracking-[0.2em] text-center">
                                Select items from wardrobe to build an outfit
                            </p>
                        </div>
                    ) : (
                        canvasItems.map(item => (
                            <div key={`canvas-${item.id}`} className="relative group cursor-pointer w-40 md:w-56" onClick={() => removeFromCanvas(item.id)}>
                                <img src={item.images[0] || "/placeholder.jpg"} alt={item.name} className="w-full h-auto object-cover shadow-sm" />
                                
                                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icon icon={X} size={20} className="text-black mb-2" decorative={true} />
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-black">Remove</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* AREA LEMARI / WARDROBE (KANAN) */}
                <div className="w-full md:w-1/3 bg-white border border-gray-200 p-6 flex flex-col">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
                        <span>Your Wardrobe</span>
                        {isLoading && (
                            <span className="flex items-center gap-2 text-gray-400 text-[9px] animate-pulse">
                                <Icon icon={Loader2} size={10} className="animate-spin" decorative={true} />
                                <span>Loading...</span>
                            </span>
                        )}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[60vh] pr-2">
                        {!isLoading && wardrobe.length === 0 && (
                            <div className="col-span-2 flex flex-col items-center justify-center pt-10 pb-4 text-gray-400 gap-3">
                                <Icon icon={ArchiveX} size={24} strokeWidth={1} decorative={true} />
                                <div className="text-[10px] text-center uppercase tracking-widest leading-relaxed">
                                    Wardrobe is empty. <br/> Add items first.
                                </div>
                            </div>
                        )}
                        {wardrobe.map(item => (
                            <div
                                key={`wardrobe-${item.id}`}
                                className="cursor-pointer group relative"
                                onClick={() => addToCanvas(item)}
                            >
                                <img src={item.images[0] || "/placeholder.jpg"} alt={item.name} className="w-full aspect-[3/4] object-cover bg-gray-100 group-hover:opacity-50 transition-opacity" />
                                <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 text-[8px] uppercase tracking-wider flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Icon icon={Plus} size={10} decorative={true} />
                                    <span>Add to Canvas</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button className="flex items-center justify-center gap-3 w-full border border-black bg-black text-white py-3 text-[10px] tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors">
                            <Icon icon={Save} size={14} decorative={true} />
                            <span>Save Outfit</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}