import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

// Import fungsi autentikasi server
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

export async function POST(req: Request) {
    try {
        // 1. Verifikasi tiket sesi (JWT) dari NextAuth
        const session = await getServerSession(authOptions);
        
        // Jika tidak ada sesi (belum login), tendang keluar dengan status 401
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized: Anda harus login untuk mencatat pemakaian (Log a Wear)." },
                { status: 401 }
            );
        }

        // 2. Ambil data yang dikirim dari Frontend (Tombol Log a Wear)
        const body = await req.json();
        
        // 3. Validasi: Pastikan ID Item tidak kosong dari request frontend
        if (!body.itemId) {
            return NextResponse.json(
                { error: "Bad Request: ID Pakaian tidak ditemukan." },
                { status: 400 }
            );
        }

        // 4. Masukkan data log pemakaian ke dalam database PostgreSQL
        const wearLog = await prisma.wearLog.create({
            data: {
                item_id: body.itemId, // Diperbaiki: Sesuai dengan skema (snake_case)
                worn_date: body.date ? new Date(body.date) : new Date(), // Diperbaiki: Menggunakan worn_date
            }
        });

        // 5. Kembalikan respons sukses
        return NextResponse.json(wearLog, { status: 201 });
        
    } catch (error) {
        console.error("Wearlog Database Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error: Gagal mencatat riwayat pemakaian." },
            { status: 500 }
        );
    }
}