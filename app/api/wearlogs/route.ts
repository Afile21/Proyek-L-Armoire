import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";
import { revalidatePath } from "next/cache"; // [BARU] Import fungsi pembersih cache Next.js

export async function POST(request: Request) {
    try {
        // Parsing body dari request (dari tombol frontend)
        const body = await request.json();
        const { itemId } = body;

        // 1. Validasi Input: Pastikan itemId benar-benar dikirim oleh client
        if (!itemId) {
            return NextResponse.json(
                { error: "Item ID is required" },
                { status: 400 } // 400 Bad Request
            );
        }

        // 2. Validasi Keamanan Database: Cek apakah Item dengan ID tersebut eksis di PostgreSQL
        const existingItem = await prisma.item.findUnique({
            where: { id: itemId },
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: "Item not found in the database. Cannot log wear." },
                { status: 404 } // 404 Not Found
            );
        }

        // 3. Eksekusi Aman: Tambahkan catatan pemakaian (WearLog) baru
        // Tanggal (date) akan otomatis diisi dengan waktu saat ini berkat @default(now()) di skema Prisma
        const newWearLog = await prisma.wearLog.create({
            data: {
                item_id: itemId,
            },
        });

        // [BARU] 3.5. On-Demand Revalidation: Bersihkan cache server Next.js
        // Ini memastikan halaman katalog dan halaman detail memuat ulang kalkulasi CPW terbaru dari database
        revalidatePath("/catalog"); 
        revalidatePath(`/catalog/${itemId}`);

        // 4. Kembalikan respons sukses ke frontend
        return NextResponse.json(newWearLog, { status: 201 }); // 201 Created

    } catch (error) {
        // Menangkap error tak terduga agar server/aplikasi tidak mati (crash)
        console.error("FAILED TO LOG WEAR:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred on the server." },
            { status: 500 } // 500 Internal Server Error
        );
    }
}