import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/authOptions';
import { Season, Status, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Strict Type untuk parameter Next.js App Router (Promise untuk Next.js 15+)
interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

// Strict Type untuk payload Update
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

// ============================================================================
// 1. METHOD GET — Menarik data awal untuk form Edit (Aman & Lengkap)
// ============================================================================
export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        // [FITUR KEAMANAN]: Hanya user yang login yang bisa mengambil data
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json({ error: 'ID Item tidak valid.' }, { status: 400 });
        }

        // [FITUR KELENGKAPAN DATA]: Menarik data item beserta data relasi kategorinya
        const item = await prisma.item.findUnique({
            where: { id },
            include: { category: true } 
        });

        if (!item) {
            return NextResponse.json({ error: 'Item pakaian tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });

    } catch (error: unknown) {
        console.error('Error fetching item [GET /api/items/[id]]:', error);
        return NextResponse.json(
            { error: 'Internal Server Error. Gagal mengambil data.' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 2. METHOD PUT — Menyimpan perubahan data dari form Edit
// ============================================================================
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        // [FITUR KEAMANAN]: Hanya user yang login yang bisa mengubah data
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json(
                { error: 'ID Item tidak ditemukan dalam parameter.' },
                { status: 400 }
            );
        }

        const body = (await request.json()) as ItemUpdatePayload;

        const existingItem = await prisma.item.findUnique({
            where: { id },
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: 'Item pakaian tidak ditemukan.' },
                { status: 404 }
            );
        }

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

        const updatedItem = await prisma.item.update({
            where: { id },
            data: updateData,
            include: { category: true },
        });

        // [INVALIDASI CACHE]: Memastikan data terbaru langsung muncul di halaman katalog
        revalidatePath('/catalog');
        revalidatePath(`/catalog/${id}`);

        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error: unknown) {
        console.error('Error updating item [PUT /api/items/[id]]:', error);
        return NextResponse.json(
            { error: 'Internal Server Error. Gagal memperbarui data.' },
            { status: 500 }
        );
    }
}