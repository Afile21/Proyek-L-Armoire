import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/authOptions';
import { Season, Status, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Strict Type untuk parameter Next.js App Router
interface RouteParams {
    params: {
        id: string;
    };
}

// Strict Type untuk payload Update (semua field bersifat opsional karena ini PUT/PATCH)
interface ItemUpdatePayload {
    name?: string;
    images?: string[];
    video_url?: string | null;
    brand?: string;
    size?: string;
    purchase_date?: string;
    wash_instructions?: string | null;
    price?: number;
    base_color?: string;
    material?: string;
    genre?: string;
    season?: Season;
    status?: Status;
    categoryId?: string;
}

export async function PUT(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        // 1. Verifikasi Sesi (Wajib Login)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { error: 'ID Item tidak ditemukan dalam parameter.' },
                { status: 400 }
            );
        }

        // 2. Parse Payload
        const body = (await request.json()) as ItemUpdatePayload;

        // 3. Pengecekan Eksistensi Data di Database
        const existingItem = await prisma.item.findUnique({
            where: { id },
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: 'Item pakaian tidak ditemukan.' },
                { status: 404 }
            );
        }

        // 4. Membangun objek data yang akan diupdate secara dinamis dan strict
        // Prisma secara otomatis mengabaikan field yang bernilai `undefined`
        const updateData: Prisma.ItemUpdateInput = {
            ...(body.name && { name: body.name }),
            ...(body.images && { images: body.images }),
            ...(body.video_url !== undefined && { video_url: body.video_url }),
            ...(body.brand && { brand: body.brand }),
            ...(body.size && { size: body.size }),
            ...(body.purchase_date && { purchase_date: new Date(body.purchase_date) }),
            ...(body.wash_instructions !== undefined && { wash_instructions: body.wash_instructions }),
            ...(body.price !== undefined && { price: body.price }),
            ...(body.base_color && { base_color: body.base_color }),
            ...(body.material && { material: body.material }),
            ...(body.genre && { genre: body.genre }),
            ...(body.season && { season: body.season }),
            ...(body.status && { status: body.status }),
            ...(body.categoryId && { 
                category: { connect: { id: body.categoryId } } 
            }),
        };

        // 5. Eksekusi Update ke Database
        const updatedItem = await prisma.item.update({
            where: { id },
            data: updateData,
            include: { category: true }, // Return dengan data kategori
        });

        // 6. Invalidasi Cache agar tampilan Katalog dan Detail langsung ter-refresh
        revalidatePath('/catalog');
        revalidatePath(`/catalog/${id}`);

        // 7. Berikan Response
        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error: unknown) {
        console.error('Error updating item [PUT /api/items/[id]]:', error);
        return NextResponse.json(
            { error: 'Internal Server Error. Gagal memperbarui data.' },
            { status: 500 }
        );
    }
}