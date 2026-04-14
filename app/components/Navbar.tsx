"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import Icon from "./Icon";
import { Menu, X, LayoutGrid, Shirt, Sparkles, Plus, User, LogOut, LogIn } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session, status } = useSession();

    return (
        <>
            {/* Header Statis di Atas */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-[#E5E5E5]">
                <div className="flex items-center justify-between px-6 py-4">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 text-black text-xs tracking-[0.2em] uppercase hover:opacity-50 transition-opacity"
                    >
                        <Icon icon={Menu} size={16} decorative={true} />
                        <span>Menu</span>
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
                <div className="fixed inset-0 z-[60] bg-white flex flex-col p-8 animate-in fade-in duration-300 overflow-y-auto">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="self-end flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] hover:opacity-50 transition-opacity mb-16"
                    >
                        <span>Close</span>
                        <Icon icon={X} size={14} decorative={true} />
                    </button>

                    {/* Navigasi Utama */}
                    <nav className="font-playfair flex flex-col space-y-8">
                        <Link href="/" onClick={() => setIsOpen(false)} className="group flex items-center gap-6 text-4xl lg:text-5xl uppercase tracking-tight text-black transition-opacity hover:opacity-40">
                            <Icon icon={LayoutGrid} size={32} strokeWidth={1} className="text-[#A3A3A3] group-hover:text-black transition-colors" decorative={true} />
                            <span>Home</span>
                        </Link>
                        <Link href="/catalog" onClick={() => setIsOpen(false)} className="group flex items-center gap-6 text-4xl lg:text-5xl uppercase tracking-tight text-black transition-opacity hover:opacity-40">
                            <Icon icon={Shirt} size={32} strokeWidth={1} className="text-[#A3A3A3] group-hover:text-black transition-colors" decorative={true} />
                            <span>Catalog</span>
                        </Link>
                        <Link href="/lookbook" onClick={() => setIsOpen(false)} className="group flex items-center gap-6 text-4xl lg:text-5xl uppercase tracking-tight text-black transition-opacity hover:opacity-40">
                            <Icon icon={Sparkles} size={32} strokeWidth={1} className="text-[#A3A3A3] group-hover:text-black transition-colors" decorative={true} />
                            <span>Lookbook</span>
                        </Link>
                        
                        {/* Tampilkan menu Add Item HANYA jika pengguna sudah terautentikasi */}
                        {session && (
                            <Link href="/add" onClick={() => setIsOpen(false)} className="group flex items-center gap-6 text-4xl lg:text-5xl text-[#A3A3A3] uppercase tracking-tight hover:text-black transition-colors pt-4">
                                <Icon icon={Plus} size={32} strokeWidth={1} className="text-[#A3A3A3] group-hover:text-black transition-colors" decorative={true} />
                                <span>Add Item</span>
                            </Link>
                        )}
                    </nav>

                    {/* Seksi Autentikasi bergaya Editorial Minimalis */}
                    <div className="mt-auto pt-12 flex flex-col">
                        {/* Divider 1px sesuai desain sistem BRD */}
                        <div className="w-full h-[1px] bg-[#E5E5E5] mb-8"></div>

                        {status === "loading" ? (
                            <span className="text-[10px] tracking-[0.3em] uppercase text-[#A3A3A3]">Verifying...</span>
                        ) : session ? (
                            <div className="flex flex-col">
                                <span className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#A3A3A3] mb-2">
                                    <Icon icon={User} size={12} decorative={true} />
                                    Account
                                </span>
                                <span className="font-inter text-xs tracking-widest text-black uppercase mb-6">
                                    {session.user?.email}
                                </span>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        signOut();
                                    }}
                                    className="self-start flex items-center gap-3 text-[11px] font-inter tracking-[0.2em] uppercase text-black border-b border-black pb-1 hover:text-[#A3A3A3] hover:border-[#A3A3A3] transition-all"
                                >
                                    <Icon icon={LogOut} size={14} decorative={true} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("google")}
                                className="self-start flex items-center gap-3 text-[11px] font-inter tracking-[0.2em] uppercase text-black border-b border-black pb-1 hover:text-[#A3A3A3] hover:border-[#A3A3A3] transition-all"
                            >
                                <Icon icon={LogIn} size={14} decorative={true} />
                                <span>Sign In / Private Access</span>
                            </button>
                        )}
                        
                        <div className="mt-12 text-[9px] text-[#A3A3A3] tracking-[0.4em] uppercase">
                            L&#39;Armoire System
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}