import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/authOptions';
import { Season, Status } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Strict Type untuk Payload
interface ItemPayload {
    name: string;
    images: string[];
    video_url?: string;
    brand: string;
    size: string;
    purchase_date: string;
    wash_instructions?: string;
    price: number;
    base_color: string;
    material: string;
    genre: string;
    season: Season;
    status: Status;
    categoryId: string; // Relasi ke model Category
}

export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const items = await prisma.item.findMany({
            orderBy: { created_at: 'desc' },
            include: { category: true }, // Mengambil data nama kategori juga
        });

        return NextResponse.json(items, { status: 200 });
    } catch (error: unknown) {
        console.error('Error fetching items:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json()) as Partial<ItemPayload>;

        // Validasi Kelengkapan (Strict)
        if (!body.name || !body.categoryId || body.price === undefined) {
            return NextResponse.json(
                { error: 'Nama, Kategori, dan Harga wajib diisi.' },
                { status: 400 }
            );
        }

        const newItem = await prisma.item.create({
            data: {
                name: body.name,
                images: body.images || [],
                video_url: body.video_url || null,
                brand: body.brand || 'Unknown',
                size: body.size || 'OS',
                purchase_date: body.purchase_date ? new Date(body.purchase_date) : new Date(),
                wash_instructions: body.wash_instructions || null,
                price: body.price,
                base_color: body.base_color || '#000000',
                material: body.material || 'Unknown',
                genre: body.genre || 'General',
                season: body.season as Season,
                status: body.status as Status,
                categoryId: body.categoryId,
            },
        });

        // Update Cache
        revalidatePath("/catalog");

        return NextResponse.json(newItem, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating item:', error);
        return NextResponse.json(
            { error: 'Gagal menyimpan data ke database.' },
            { status: 500 }
        );
    }
}