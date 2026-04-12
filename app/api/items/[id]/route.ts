import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/authOptions';
import { Season, Status, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import cloudinary, { extractPublicIdFromUrl } from '@/app/utils/cloudinary';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

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

export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json({ error: 'ID Item tidak valid.' }, { status: 400 });
        }

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

export async function PUT(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
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

        // ====================================================================
        // CLEAN PRODUCTION CLOUDINARY DELETE
        // ====================================================================
        if (body.images && existingItem.images) {
            const oldImages = existingItem.images;
            const newImages = body.images;

            const imagesToDelete = oldImages.filter((oldImg) => !newImages.includes(oldImg));

            for (const imgUrl of imagesToDelete) {
                const publicId = extractPublicIdFromUrl(imgUrl);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId);
                        // Cukup 1 baris log ringkas untuk memantau aktivitas server
                        console.log(`[Cloudinary] Aset lama dihapus: ${publicId}`);
                    } catch (cloudinaryError: unknown) {
                        console.error(`[Cloudinary] Gagal menghapus ${publicId}:`, cloudinaryError);
                    }
                }
            }
        }
        // ====================================================================

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

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Verifikasi Autentikasi
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: Silakan login terlebih dahulu." },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found." },
                { status: 404 }
            );
        }

        const itemId = params.id;

        // 2. Ambil data item untuk memastikan eksistensi dan kepemilikan
        const existingItem = await prisma.item.findUnique({
            where: { id: itemId },
        });

        if (!existingItem) {
            return NextResponse.json(
                { success: false, message: "Item tidak ditemukan." },
                { status: 404 }
            );
        }

        if (existingItem.userId !== user.id) {
            return NextResponse.json(
                { success: false, message: "Forbidden: Anda tidak memiliki akses untuk menghapus item ini." },
                { status: 403 }
            );
        }

        // 3. Hapus gambar dari Cloudinary jika ada
        if (existingItem.imageUrl) {
            const publicId = extractPublicIdFromUrl(existingItem.imageUrl);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        // 4. Hapus data dari PostgreSQL
        // Catatan: Karena onDelete: Cascade sudah ada di Schema untuk relasi (WearLog, dll),
        // kita cukup menghapus Item utama.
        await prisma.item.delete({
            where: { id: itemId },
        });

        // 5. Invalidate Cache agar UI Katalog langsung ter-update
        revalidatePath("/catalog");
        revalidatePath("/");

        return NextResponse.json(
            { success: true, message: "Item berhasil dihapus." },
            { status: 200 }
        );

    } catch (error: unknown) {
        let errorMessage = "Terjadi kesalahan internal saat menghapus item.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error("[DELETE_ITEM_ERROR]:", errorMessage);

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
}