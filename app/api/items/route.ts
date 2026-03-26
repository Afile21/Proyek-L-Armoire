import { prisma } from "@/app/utils/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        // 1. Menerima data dari Frontend
        const body = await req.json();

        // [BARU] 2a. Validasi Kelengkapan Data (Mencegah Field Kosong)
        if (!body.name || !body.brand || !body.category || !body.season || !body.imageUrl) {
            return NextResponse.json(
                { error: "Semua data (nama, brand, kategori, musim, gambar) wajib diisi." },
                { status: 400 } // 400 Bad Request
            );
        }

        // [BARU] 2b. Validasi Tipe Data Harga (Mencegah NaN masuk ke PostgreSQL)
        const parsedPrice = parseFloat(body.price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return NextResponse.json(
                { error: "Format harga tidak valid. Harus berupa angka positif." },
                { status: 400 } // 400 Bad Request
            );
        }

        // 3. Menyimpan data ke Database PostgreSQL menggunakan Prisma
        const newItem = await prisma.item.create({
            data: {
                name: body.name,
                brand: body.brand,
                price: parsedPrice, // <--- Menggunakan variabel harga yang sudah dijamin aman (bukan NaN)
                category: body.category,
                season: body.season,
                images: [body.imageUrl], 
                
                // Data default (sementara) untuk field wajib lainnya di database
                size: "OS",
                purchase_date: new Date(),
                base_color: "BLACK",
                material: "UNKNOWN",
                genre: "LUXURY",
                status: "ACTIVE"
            }
        });

        // 4. Membersihkan cache halaman katalog agar item baru langsung muncul
        revalidatePath("/catalog");
        
        // 5. Mengirim respons sukses ke Frontend
        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        // Mengecek dengan aman apakah error memiliki pesan (message)
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui";
        
        // Tampilkan pesan eror detail di terminal VSCode
        console.error("Database Error Detail:", errorMessage); 
        
        return NextResponse.json(
            { error: "Gagal menyimpan data pakaian", detail: errorMessage }, 
            { status: 500 }
        );
    }
}

// Fungsi GET untuk mengambil data ke Katalog (Tetap dipertahankan)
export async function GET() {
    try {
        // Mengambil semua item dari database, diurutkan dari yang terbaru
        const items = await prisma.item.findMany({
            orderBy: { created_at: 'desc' }
        });
        
        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Gagal mengambil data katalog" }, { status: 500 });
    }
}