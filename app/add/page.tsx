"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { broadcastDataChange } from "../utils/broadcast";

export default function AddItem() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // State untuk menyimpan inputan user (DITAMBAH: name)
    const [formData, setFormData] = useState({
        name: "", // <--- TAMBAHAN BARU
        brand: "",
        price: "",
        category: "TOP",
        season: "ALL_SEASON"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Please select an image first.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. UPLOAD KE CLOUDINARY
            const imageFormData = new FormData();
            imageFormData.append("file", file);
            imageFormData.append("upload_preset", "larmoire_unsigned");

            const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/dpkdulvoa/image/upload`, {
                method: "POST",
                body: imageFormData,
            });

            const cloudinaryData = await cloudinaryRes.json();
            const imageUrl = cloudinaryData.secure_url;

            // --- TAMBAHKAN PENGECEKAN INI ---
            if (!imageUrl) {
                alert("Gagal mengunggah gambar ke Cloudinary! Pastikan preset sudah benar.");
                setIsSubmitting(false);
                return; // Hentikan proses agar tidak eror masuk ke database
            }
            // --------------------------------

            // 2. SIMPAN KE DATABASE (Mengirim data + URL gambar ke API kita)
            const dbRes = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    imageUrl: imageUrl
                }),
            });

            

           if (dbRes.ok) {
                alert("Item successfully added to wardrobe!");
                
                // 2. TAMBAHKAN BARIS INI UNTUK MENGIRIM SINYAL
                broadcastDataChange("ADD_ITEM");

                router.refresh(); 
                router.push("/catalog"); // Otomatis kembali ke halaman katalog
            } else {
                alert("Failed to save to database.");
            }

        } catch (error) {
            console.error(error);
            alert("An error occurred during upload.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen pt-28 px-4 md:px-8 pb-20 max-w-3xl mx-auto">
            <Link href="/catalog" className="text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors mb-12 block">
                &larr; Back to Catalog
            </Link>

            <h1 className="text-4xl uppercase tracking-tighter mb-12 border-b border-gray-100 pb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
                Add to Wardrobe
            </h1>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Upload Foto */}
                <div className="space-y-4">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-400">Image Upload</label>
                    <label className="flex flex-col items-center justify-center w-full h-48 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <span className="text-xs text-black group-hover:text-gray-500 transition-colors uppercase tracking-[0.2em]">
                                {file ? file.name : "+ Select High-Quality Image"}
                            </span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </label>
                </div>

                {/* Input Text Dasar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    
                    {/* TAMBAHAN BARU: Input untuk Nama Item */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Item Name</label>
                        <input
                            type="text" required placeholder="e.g. OVERSIZED WOOL BLAZER"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Brand</label>
                        <input
                            type="text" required placeholder="e.g. MAISON MARGIELA"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Price (IDR)</label>
                        <input
                            type="number" required placeholder="e.g. 12500000"
                            className="border-b border-gray-200 pb-3 outline-none text-sm placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Category</label>
                        <select
                            className="border-b border-gray-200 pb-3 outline-none text-sm bg-transparent cursor-pointer focus:border-black transition-colors"
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="TOP">TOP</option>
                            <option value="BOTTOM">BOTTOM</option>
                            <option value="OUTERWEAR">OUTERWEAR</option>
                            <option value="SHOES">SHOES</option>
                            <option value="ACCESSORIES">ACCESSORIES</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Season</label>
                        <select
                            className="border-b border-gray-200 pb-3 outline-none text-sm bg-transparent cursor-pointer focus:border-black transition-colors"
                            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        >
                            <option value="ALL_SEASON">ALL SEASON</option>
                            <option value="SPRING">SPRING</option>
                            <option value="SUMMER">SUMMER</option>
                            <option value="AUTUMN">AUTUMN</option>
                            <option value="WINTER">WINTER</option>
                        </select>
                    </div>
                </div>

                {/* Tombol Submit */}
                <div className="pt-8">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full border border-black bg-black text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Uploading to Cloud..." : "Save Item"}
                    </button>
                </div>
            </form>
        </main>
    );
}