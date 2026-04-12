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

            toast.success("Item berhasil dihapus dari arsip.", {
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
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-medium text-gray-500 hover:text-black transition-colors uppercase tracking-widest underline underline-offset-4 decoration-transparent hover:decoration-black"
                aria-label="Hapus Item"
            >
                Delete
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div
                        className="bg-white w-full max-w-md p-8 shadow-2xl transform transition-all"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header Modal - Meniru gaya editorial */}
                        <h2 className="text-2xl font-serif text-black mb-3">
                            Hapus Pakaian?
                        </h2>

                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Tindakan ini permanen. Item beserta seluruh riwayat pemakaian (Wear Log) dan kalkulasi metrik akan dihapus secara permanen dari arsip <i>L&#39;Armoire</i> Anda.
                        </p>

                        {/* Aksi Tombol */}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                                className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-30 flex items-center justify-center"
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