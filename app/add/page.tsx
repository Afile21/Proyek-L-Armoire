"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { broadcastDataChange } from "../utils/broadcast";
import toast from "react-hot-toast";

export default function AddItem() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State untuk file dan preview
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // [BARU] State untuk URL gambar sementara

    const [formData, setFormData] = useState({
        name: "", 
        brand: "",
        price: "",
        category: "TOP",
        season: "ALL_SEASON"
    });

    // [BARU] Fungsi khusus untuk menangani dan memvalidasi file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // 1. Validasi Format (Hanya izinkan JPG, PNG, WEBP)
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            toast.error("Format tidak didukung. Silakan gunakan JPG, PNG, atau WEBP.");
            return;
        }

        // 2. Validasi Ukuran (Maksimal 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB dalam bytes
        if (selectedFile.size > maxSize) {
            toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
            return;
        }

        // Jika lolos validasi, simpan file dan buat URL preview
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!file) {
            toast.error("Peringatan: Silakan pilih gambar terlebih dahulu.");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Uploading to Cloud...");

        try {
            const imageFormData = new FormData();
            imageFormData.append("file", file);
            imageFormData.append("upload_preset", "larmoire_unsigned");

            const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/dpkdulvoa/image/upload`, {
                method: "POST",
                body: imageFormData,
            });

            if (!cloudinaryRes.ok) {
                throw new Error("Gagal terhubung ke server Cloudinary.");
            }

            const cloudinaryData = await cloudinaryRes.json();
            const imageUrl = cloudinaryData.secure_url;

            if (!imageUrl) {
                throw new Error("Gagal mengunggah gambar ke Cloudinary! Pastikan preset sudah benar.");
            }

            toast.loading("Saving to Wardrobe...", { id: loadingToast });

            const dbRes = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    imageUrl: imageUrl
                }),
            });

            if (!dbRes.ok) {
                const errorData = await dbRes.json();
                throw new Error(errorData.detail || errorData.error || "Gagal menyimpan ke database."); 
            }

            toast.success("Berhasil! Item telah ditambahkan ke lemari Anda.", { id: loadingToast });
            broadcastDataChange("ADD_ITEM");
            router.refresh();
            router.push("/catalog"); 

        } catch (error) {
            console.error("Proses Upload Gagal:", error);
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah.";
            toast.error(`Gagal: ${errorMessage}`, { id: loadingToast });
            
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
                {/* Upload Foto dengan Live Preview */}
                <div className="space-y-4">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-400">Image Upload</label>
                    <label className="relative flex flex-col items-center justify-center w-full h-72 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden">
                        
                        {/* Jika ada preview, tampilkan gambarnya */}
                        {previewUrl ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                                {/* Overlay gelap saat di-hover agar teks 'Change Image' terlihat */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white text-xs uppercase tracking-[0.2em] font-medium border border-white px-4 py-2">
                                        Change Image
                                    </span>
                                </div>
                            </>
                        ) : (
                            // Jika belum ada file, tampilkan instruksi
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                <span className="text-xs text-black group-hover:text-gray-500 transition-colors uppercase tracking-[0.2em] mb-2">
                                    + Select High-Quality Image
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-[0.1em]">
                                    JPG, PNG, or WEBP (Max 5MB)
                                </span>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/webp" // Membatasi pilihan di File Explorer bawaan OS
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </label>
                </div>

                {/* Input Text Dasar (Tidak ada perubahan) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
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