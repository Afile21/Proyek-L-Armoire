import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    const categories: string[] = [
        'Tops',
        'Bottoms',
        'Outerwear',
        'Shoes',
        'Accessories'
    ];

    console.log('Mulai proses seeding data kategori...');

    for (const name of categories) {
        const category = await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        console.log(`Berhasil memproses kategori: ${category.name}`);
    }

    console.log('✅ Seeding kategori selesai.');
}

main()
    .catch((e: unknown) => {
        console.error('Terjadi kesalahan saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });