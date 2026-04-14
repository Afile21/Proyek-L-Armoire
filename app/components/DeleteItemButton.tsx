"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DeleteItemButtonProps {
    itemId: string;
}

export default function DeleteItemButton({ itemId }: DeleteItemButtonProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/items/${itemId}`, {
                method: "DELETE",
            });

            const data = (await response.json()) as { success: boolean; message: string };

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Gagal menghapus item.");
            }

            toast.success("Item berhasil dihapus.", {
                style: {
                    borderRadius: "0",
                    background: "#000",
                    color: "#fff",
                },
            });

            setIsOpen(false);

            // Redirect ke katalog dan paksa refresh data
            router.push("/catalog");
            router.refresh();

        } catch (error: unknown) {
            let errorMessage = "Terjadi kesalahan saat menghapus item.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage, {
                style: {
                    borderRadius: "0",
                    border: "1px solid #000",
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Tombol dimodifikasi: Hapus underline, tambahkan struktur border dan flex agar sama persis seperti tombol Edit */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex w-full h-full items-center justify-center border border-gray-200 bg-transparent text-gray-500 py-4 text-[10px] tracking-[0.2em] uppercase hover:border-black hover:text-black transition-colors duration-300"
                aria-label="Hapus Item"
            >
                Delete
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    {/* Menggunakan padding dan max-width yang proporsional */}
                    <div
                        className="bg-white w-full max-w-sm p-10 shadow-2xl transform transition-all flex flex-col"
                        role="dialog"
                        aria-modal="true"
                    >
                        <h2 className="text-2xl uppercase tracking-tighter text-black mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                            Hapus Pakaian?
                        </h2>

                        {/* Teks diperpendek agar lebih elegan dan tidak memenuhi ruang */}
                        <p className="text-xs text-gray-500 mb-8 leading-relaxed tracking-wider">
                            Tindakan ini permanen. Item dan riwayat pemakaian akan dihapus.
                        </p>

                        <div className="flex justify-end gap-4 mt-auto">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                                className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 hover:text-black border border-transparent hover:border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? "Memproses..." : "Konfirmasi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}