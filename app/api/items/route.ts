import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        // 1. Menerima data dari Frontend
        const body = await req.json();

        // 2. Menyimpan data ke Database PostgreSQL menggunakan Prisma
        const newItem = await prisma.item.create({
            data: {
                name: body.name, // <--- TAMBAHAN BARU: Menyimpan nama item
                brand: body.brand,
                price: parseFloat(body.price),
                category: body.category,
                season: body.season,
                images: [body.imageUrl], // URL dari Cloudinary

                // Data default (sementara) untuk field wajib lainnya di database
                size: "OS",
                purchase_date: new Date(),
                base_color: "BLACK",
                material: "UNKNOWN",
                genre: "LUXURY",
                status: "ACTIVE"
            }
        });

        // 3. Mengirim respons sukses ke Frontend
        return NextResponse.json(newItem, { status: 201 });
    // ... kode di atasnya
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

// <--- TAMBAHAN BARU FASE 7: Fungsi GET untuk mengambil data --->
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