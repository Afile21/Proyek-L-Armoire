import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mendefinisikan tipe data eksplisit untuk menghindari 'any'
interface CategorySeedData {
    name: string;
    sizes: string[];
}

async function main(): Promise<void> {
    const categoriesData: CategorySeedData[] = [
        { 
            name: 'Tops', 
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'] 
        },
        { 
            name: 'Bottoms', 
            sizes: ['24', '26', '28', '30', '32', '34', '36', '38', '40', 'S', 'M', 'L', 'XL'] 
        },
        { 
            name: 'Outerwear', 
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'] 
        },
        { 
            name: 'Shoes', 
            sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] 
        },
        { 
            name: 'Accessories', 
            sizes: ['One Size'] 
        }
    ];

    console.log('Mulai proses seeding data kategori beserta ukurannya...');

    for (const data of categoriesData) {
        const category = await prisma.category.upsert({
            where: { name: data.name },
            update: { sizes: data.sizes }, // Memperbarui kategori lama agar memiliki sizes
            create: { name: data.name, sizes: data.sizes }, // Membuat kategori baru beserta sizes
        });
        console.log(`Berhasil memproses kategori: ${category.name} dengan ${category.sizes.length} ukuran.`);
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