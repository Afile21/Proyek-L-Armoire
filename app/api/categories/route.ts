import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/authOptions';
import { Category } from '@prisma/client'; // <-- Tambahan untuk strict typing

export async function GET(): Promise<NextResponse> {
  try {
    // API Protection (Fitur dari Fase 12 tetap aman)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil semua kategori, urutkan berdasarkan nama, dengan tipe eksplisit
    const categories: Category[] = await prisma.category.findMany({
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