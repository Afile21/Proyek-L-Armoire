// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; 
import { Toaster } from "react-hot-toast"; 
import AuthProvider from "./components/AuthProvider"; // [BARU] Import AuthProvider

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
        {/* [BARU] Bungkus seluruh elemen aplikasi dengan AuthProvider */}
        <AuthProvider>
          <Navbar />
          
          {/* Konfigurasi Global Luxury Toast */}
          <Toaster 
            position="top-center"
            toastOptions={{
              // Styling default untuk semua toast (Gaya Zara: Minimalis, Tajam, Monokrom)
              style: {
                background: '#000000',
                color: '#ffffff',
                borderRadius: '0px', // Tanpa sudut membulat untuk kesan tajam/editorial
                border: '1px solid #333333',
                textTransform: 'uppercase',
                fontSize: '12px',
                letterSpacing: '0.05em',
                padding: '16px 24px',
              },
              // Kustomisasi khusus saat sukses
              success: {
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#000000',
                },
              },
              // Kustomisasi khusus saat error
              error: {
                style: {
                  background: '#000000',
                  color: '#ffffff',
                  borderRadius: '0px',
                  border: '1px solid #7f1d1d', // Border merah gelap yang elegan
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  padding: '16px 24px',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />

          {/* Kontainer utama konten */}
          <div className="grow"> 
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}