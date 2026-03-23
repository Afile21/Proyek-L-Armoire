import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        // Menerima ID baju dari frontend
        const body = await request.json();
        const { itemId } = body;

        if (!itemId) {
            return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
        }

        // Menyimpan log pemakaian ke database (tanggal otomatis hari ini)
        const wearLog = await prisma.wearLog.create({
            data: {
                item_id: itemId,
                wear_date: new Date(),
            }
        });

        return NextResponse.json({ success: true, wearLog }, { status: 201 });
    } catch (error) {
        console.error("Error creating WearLog:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}