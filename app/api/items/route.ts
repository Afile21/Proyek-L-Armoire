import { prisma } from "@/app/utils/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Import fungsi untuk mengecek sesi di sisi server
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

export async function POST(req: Request) {
    try {
        // Cek apakah ada sesi user yang valid
        const session = await getServerSession(authOptions);
        
        // Jika tidak ada sesi (belum login), tolak request dengan status 401 Unauthorized
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized: Anda harus login untuk menambah item." },
                { status: 401 }
            );
        }

        // 1. Menerima data dari Frontend
        const body = await req.json();

        // 2a. Validasi Kelengkapan Data (Mencegah Field Kosong)
        // [UPDATE] Menambahkan validasi untuk purchase_date
        if (!body.name || !body.brand || !body.category || !body.season || !body.imageUrl || !body.purchase_date) {
            return NextResponse.json(
                { error: "Semua data wajib diisi (termasuk tanggal pembelian dan gambar)." },
                { status: 400 } // 400 Bad Request
            );
        }

        // 2b. Validasi Tipe Data Harga (Mencegah NaN masuk ke PostgreSQL)
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
                price: parsedPrice, 
                category: body.category,
                season: body.season,
                images: [body.imageUrl], 
                
                // --- [BARU] Menghapus data dummy dan menggunakan data asli dari Frontend ---
                size: body.size,
                base_color: body.base_color,
                material: body.material,
                genre: body.genre,
                status: body.status,
                // Mengonversi string format YYYY-MM-DD dari input type="date" menjadi objek Date Prisma
                purchase_date: new Date(body.purchase_date) 
            }
        });

        // 4. Membersihkan cache halaman katalog
        revalidatePath("/catalog");
        
        // 5. Mengirim respons sukses ke Frontend
        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui";
        console.error("Database Error Detail:", errorMessage); 
        
        return NextResponse.json(
            { error: "Gagal menyimpan data pakaian", detail: errorMessage }, 
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Cek apakah ada sesi user yang valid sebelum menampilkan katalog via API
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized: Anda harus login untuk melihat katalog." },
                { status: 401 }
            );
        }

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