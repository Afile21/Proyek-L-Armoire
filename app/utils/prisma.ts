// app/utils/prisma.ts
import { PrismaClient } from '@prisma/client';

// Menyimpan instance Prisma di global scope untuk mencegah 
// inisialisasi berulang saat Next.js melakukan hot-reloading di mode development.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Gunakan instance yang ada, atau buat baru jika belum ada
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Jangan simpan di global scope jika berada di production
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;