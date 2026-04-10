"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { broadcastDataChange } from "@/app/utils/broadcast";
import toast from "react-hot-toast";

// Strict Types
interface Category {
    id: string;
    name: string;
    sizes: string[];
}

interface ItemData {
    id: string;
    name: string;
    brand: string;
    price: number;
    categoryId: string | null;
    season: string;
    size: string;
    base_color: string;
    material: string;
    genre: string;
    status: string;
    wash_instructions: string | null;
    purchase_date: string;
    images: string[];
}

export default function EditItem() {
    const router = useRouter();
    const params = useParams();
    const itemId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // State untuk file gambar baru (jika diubah) dan preview
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [oldImageUrl, setOldImageUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        price: "",
        categoryId: "",
        season: "ALL_SEASON",
        size: "",
        base_color: "#000000",
        material: "",
        genre: "",
        status: "ACTIVE",
        wash_instructions: "",
        purchase_date: ""
    });

    // Fetch Kategori dan Data Item saat halaman dimuat
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const catRes = await fetch("/api/categories");
                if (catRes.ok) {
                    const catData = (await catRes.json()) as Category[];
                    setCategories(catData);
                }

                // Fetch Item Data
                const itemRes = await fetch(`/api/items/${itemId}`);
                if (itemRes.ok) {
                    const itemData = (await itemRes.json()) as ItemData;
                    
                    setFormData({
                        name: itemData.name,
                        brand: itemData.brand,
                        price: itemData.price.toString(),
                        categoryId: itemData.categoryId || "",
                        season: itemData.season,
                        size: itemData.size,
                        base_color: itemData.base_color,
                        material: itemData.material,
                        genre: itemData.genre,
                        status: itemData.status,
                        wash_instructions: itemData.wash_instructions || "",
                        // Konversi ISO date ke format YYYY-MM-DD untuk input type="date"
                        purchase_date: new Date(itemData.purchase_date).toISOString().split('T')[0]
                    });

                    // Set URL gambar lama
                    if (itemData.images && itemData.images.length > 0) {
                        setOldImageUrl(itemData.images[0]);
                        setPreviewUrl(itemData.images[0]);
                    }
                } else {
                    toast.error("Gagal memuat data pakaian.");
                    router.push("/catalog");
                }
            } catch (error) {
                console.error("Gagal memuat data:", error);
                toast.error("Terjadi kesalahan jaringan.");
            } finally {
                setIsLoading(false);
            }
        };

        if (itemId) {
            fetchData();
        }
    }, [itemId, router]);

    const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
    const availableSizes = selectedCategory?.sizes || [];

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

        if (!formData.categoryId) {
            toast.error("Peringatan: Kategori wajib dipilih.");
            return;
        }
        if (!formData.size) {
            toast.error("Peringatan: Ukuran (Size) wajib dipilih.");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Updating Wardrobe...");

        try {
            let finalImageUrl = oldImageUrl;

            // Jika ada file baru, upload ke Cloudinary terlebih dahulu
            if (file) {
                toast.loading("Uploading new image to Cloud...", { id: loadingToast });
                const imageFormData = new FormData();
                imageFormData.append("file", file);
                imageFormData.append("upload_preset", "larmoire_unsigned");

                const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/dpkdulvoa/image/upload`, {
                    method: "POST",
                    body: imageFormData,
                });

                if (!cloudinaryRes.ok) throw new Error("Gagal terhubung ke server Cloudinary.");

                const cloudinaryData = await cloudinaryRes.json();
                finalImageUrl = cloudinaryData.secure_url;
            }

            if (!finalImageUrl) throw new Error("URL Gambar tidak valid.");

            toast.loading("Saving changes...", { id: loadingToast });

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                images: [finalImageUrl]
            };

            const dbRes = await fetch(`/api/items/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!dbRes.ok) {
                const errorData = await dbRes.json();
                throw new Error(errorData.detail || errorData.error || "Gagal memperbarui database.");
            }

            toast.success("Berhasil! Item telah diperbarui.", { id: loadingToast });
            broadcastDataChange("EDIT_ITEM");
            router.refresh();
            router.push(`/catalog/${itemId}`);

        } catch (error) {
            console.error("Proses Update Gagal:", error);
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan.";
            toast.error(`Gagal: ${errorMessage}`, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen pt-28 px-4 flex items-center justify-center">
                <span className="text-xs uppercase tracking-[0.2em] text-gray-400">Loading details...</span>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-28 px-4 md:px-8 pb-20 max-w-3xl mx-auto">
            <Link href={`/catalog/${itemId}`} className="text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors mb-12 block">
                &larr; Back to Item
            </Link>

            <h1 className="text-4xl uppercase tracking-tighter mb-12 border-b border-gray-100 pb-6 font-playfair font-light">
                Edit Wardrobe
            </h1>

            <form onSubmit={handleSubmit} className="space-y-12">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Item Name</label>
                        <input
                            type="text" required placeholder="e.g. OVERSIZED WOOL BLAZER"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Brand</label>
                        <input
                            type="text" required placeholder="e.g. MAISON MARGIELA"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Price (IDR)</label>
                        <input
                            type="number" required placeholder="e.g. 12500000"
                            className="border-b border-gray-200 pb-3 outline-none text-sm placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Category</label>
                        <select
                            className="border-b border-gray-200 pb-3 outline-none text-sm bg-transparent cursor-pointer focus:border-black transition-colors uppercase"
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, size: "" })}
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
                            className="border-b border-gray-200 pb-3 outline-none text-sm bg-transparent focus:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            disabled={!formData.categoryId || availableSizes.length === 0}
                            required
                        >
                            <option value="" disabled>
                                {!formData.categoryId ? "SELECT CATEGORY FIRST" : "SELECT SIZE"}
                            </option>
                            {availableSizes.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

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

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Material</label>
                        <input
                            type="text" required placeholder="e.g. 100% CASHMERE"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            value={formData.material}
                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Genre / Style</label>
                        <input
                            type="text" required placeholder="e.g. OLD MONEY, MINIMALIST"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            value={formData.genre}
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
                            value={formData.season}
                            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        >
                            <option value="ALL_SEASON">ALL SEASON</option>
                            <option value="SPRING">SPRING</option>
                            <option value="SUMMER">SUMMER</option>
                            <option value="AUTUMN">AUTUMN</option>
                            <option value="WINTER">WINTER</option>
                        </select>
                    </div>

                    <div className="flex flex-col md:col-span-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">Wash Instructions</label>
                        <input
                            type="text" placeholder="e.g. DRY CLEAN ONLY"
                            className="border-b border-gray-200 pb-3 outline-none text-sm uppercase placeholder-gray-300 focus:border-black transition-colors bg-transparent"
                            value={formData.wash_instructions}
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
                        {isSubmitting ? "Saving changes..." : "Update Item"}
                    </button>
                </div>
            </form>
        </main>
    );
}