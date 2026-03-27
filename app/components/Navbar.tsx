"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Header Statis di Atas */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
                <div className="flex items-center justify-between px-6 py-4">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="text-black text-xs tracking-[0.2em] uppercase hover:text-gray-500 transition-colors"
                    >
                        Menu
                    </button>

                    <Link href="/" className="font-playfair text-2xl font-bold uppercase tracking-tighter">
                        L&#39;Armoire
                    </Link>

                    {/* Spacer kosong agar logo L'Armoire persis di tengah */}
                    <div className="w-12"></div>
                </div>
            </header>

            {/* Menu Overlay Fullscreen (Terbuka jika tombol Menu diklik) */}
            {isOpen && (
                <div className="fixed inset-0 z-60 bg-white flex flex-col p-8 animate-in fade-in duration-300">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="self-end text-xs uppercase tracking-[0.2em] hover:text-gray-500 transition-colors mb-16"
                    >
                        Close [X]
                    </button>

                    <nav className="font-playfair flex flex-col space-y-8">
                        <Link href="/" onClick={() => setIsOpen(false)} className="text-4xl uppercase tracking-tight hover:opacity-50 transition-opacity">
                            Home
                        </Link>
                        <Link href="/catalog" onClick={() => setIsOpen(false)} className="text-4xl uppercase tracking-tight hover:opacity-50 transition-opacity">
                            Catalog
                        </Link>
                        <Link href="/lookbook" onClick={() => setIsOpen(false)} className="text-4xl uppercase tracking-tight hover:opacity-50 transition-opacity">
                            Lookbook
                        </Link>
                    </nav>

                    <div className="mt-auto pb-8 text-xs text-gray-400 tracking-widest uppercase">
                        Personal Wardrobe System
                    </div>
                </div>
            )}
        </>
    );
}