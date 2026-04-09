"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { broadcastDataChange } from "../utils/broadcast";
import toast from "react-hot-toast";

// Strict Types
interface Category {
    id: string;
    name: string;
}

export default function AddItem() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State untuk Category Dinamis
    const [categories, setCategories] = useState<Category[]>([]);

    // State untuk file dan preview (DIKEMBALIKAN)
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        price: "",
        categoryId: "", // Menggunakan categoryId dinamis
        season: "ALL_SEASON",
        size: "OS",
        base_color: "#000000", // Diubah untuk color picker
        material: "", // Diubah menjadi text kosong
        genre: "", // Diubah menjadi text kosong
        status: "ACTIVE",
        wash_instructions: "", // Atribut baru
        purchase_date: new Date().toISOString().split('T')[0]
    });

    // Fetch Kategori saat halaman dimuat
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = (await res.json()) as Category[];
                    setCategories(data);
                }
            } catch (error) {
                console.error("Gagal memuat kategori:", error);
            }
        };
        fetchCategories();
    }, []);

    // Fungsi file handle (DIKEMBALIKAN)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            toast.error("Format tidak didukung. Silakan gunakan JPG, PNG, atau WEBP.");
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
            return;
        }

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error("Peringatan: Silakan pilih gambar terlebih dahulu.");
            return;
        }
        if (!formData.categoryId) {
            toast.error("Peringatan: Kategori wajib dipilih.");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Uploading to Cloud...");

        try {
            // 1. Upload Cloudinary (Logika asli dipertahankan)
            const imageFormData = new FormData();
            imageFormData.append("file", file);
            imageFormData.append("upload_preset", "larmoire_unsigned");

            const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/dpkdulvoa/image/upload`, {
                method: "POST",
                body: imageFormData,
            });

            if (!cloudinaryRes.ok) throw new Error("Gagal terhubung ke server Cloudinary.");

            const cloudinaryData = await cloudinaryRes.json();
            const imageUrl = cloudinaryData.secure_url;

            if (!imageUrl) throw new Error("Gagal mengunggah gambar ke Cloudinary!");

            toast.loading("Saving to Wardrobe...", { id: loadingToast });

            // 2. Simpan ke Database
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                images: [imageUrl] // Sesuaikan dengan penanganan di API backend Anda jika dibutuhkan mapping ke 'images' array
            };

            const dbRes = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan.";
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

            <h1 className="text-4xl uppercase tracking-tighter mb-12 border-b border-gray-100 pb-6 font-playfair font-light">
                Add to Wardrobe
            </h1>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Upload Foto dengan Live Preview (DIKEMBALIKAN UTUH) */}
                <div className="space-y-4">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-400">Image Upload</label>
                    <label className="relative flex flex-col items-center justify-center w-full h-72 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden">

                        {previewUrl ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white text-xs uppercase tracking-[0.2em] font-medium border border-white px-4 py-2">
                                        Change Image
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                <span className="text-xs text-black group-hover:text-gray-500 transition-colors uppercase tracking-[0.2em] mb-2">
                                    + Select High-Quality Image
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                                    JPG, PNG, or WEBP (Max 5MB)
                                </span>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </label>
                </div>

                {/* Input Text Dasar */}
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

                    {/* FETCH CATEGORY DINAMIS */}
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Category</label>
                        <select
                            className="border-b border-gray-200 pb-3 outline-none text-sm bg-transparent cursor-pointer focus:border-black transition-colors uppercase"
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            required
                        >
                            <option value="" disabled>SELECT CATEGORY</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Size</label>
                        <select
                            className="border-b border-gray-200 pb-3 outline-none text-sm bg-transparent cursor-pointer focus:border-black transition-colors"
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        >
                            <option value="OS">OS (ONE SIZE)</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="CUSTOM">CUSTOM/TAILORED</option>
                        </select>
                    </div>

                    {/* BASE COLOR DIUBAH JADI COLOR PICKER (Estetik) */}
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Base Color</label>
                        <div className="flex items-center gap-4 border-b border-gray-200 pb-2 transition-colors focus-within:border-black">
                            <input
                                type="color"
                                value={formData.base_color}
                                onChange={(e) => setFormData({ ...formData, base_color: e.target.value })}
                                className="h-6 w-10 cursor-pointer rounded-none border-0 p-0 focus:outline-none"
                            />
                            <span className="text-sm uppercase text-gray-600 font-mono">
                                {formData.base_color}
                            </span>
                        </div>
                    </div>

                    {/* MATERIAL DIUBAH JADI TEXT */}
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Material</label>
                        <input
                            type="text" required placeholder="e.g. 100% CASHMERE"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        />
                    </div>

                    {/* GENRE DIUBAH JADI TEXT */}
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Genre / Style</label>
                        <input
                            type="text" required placeholder="e.g. OLD MONEY, MINIMALIST"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Item Status</label>
                        <select
                            className="border-b border-gray-200 pb-3 outline-none text-sm bg-transparent cursor-pointer focus:border-black transition-colors"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="WASH">WASH (IN LAUNDRY)</option>
                            <option value="REPAIR">REPAIR</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                            <option value="DONATED">DONATED</option>
                            <option value="LOST">LOST</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Purchase Date</label>
                        <input
                            type="date" required
                            className="border-b border-gray-200 pb-3 outline-none text-sm placeholder-gray-300 focus:border-black transition-colors bg-transparent uppercase cursor-pointer"
                            value={formData.purchase_date}
                            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                        />
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

                    {/* WASH INSTRUCTIONS BARU */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Wash Instructions</label>
                        <input
                            type="text" placeholder="e.g. DRY CLEAN ONLY"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            onChange={(e) => setFormData({ ...formData, wash_instructions: e.target.value })}
                        />
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