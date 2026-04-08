import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/authOptions';

export async function GET(): Promise<NextResponse> {
  try {
    // API Protection
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil semua kategori, urutkan berdasarkan nama
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}