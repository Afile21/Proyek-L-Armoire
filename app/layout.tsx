import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; // Kita akan membuat ini di langkah 2

// Mengonfigurasi Font Inter untuk teks biasa (modern & bersih)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Mengonfigurasi Font Playfair Display untuk judul (kesan luxury/editorial)
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "L'Armoire | Personal Wardrobe",
  description: "Personal Wardrobe & Investment System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-black min-h-screen flex flex-col`}
      >
        <Navbar />
        {/* Kontainer utama konten */}
        <div className="flex-grow"> 
          {children}
        </div>
      </body>
    </html>
  );
}