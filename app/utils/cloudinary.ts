import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary SDK untuk backend
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Mengekstrak public_id dari URL aman Cloudinary.
 * Berguna untuk menghapus aset menggunakan Cloudinary API.
 * * @param url - URL gambar Cloudinary (cth: https://res.cloudinary.com/.../upload/v1234/folder/file.jpg)
 * @returns string berupa public_id (cth: folder/file) atau null jika gagal.
 */
export function extractPublicIdFromUrl(url: string): string | null {
    if (!url || typeof url !== 'string') return null;

    try {
        // Cloudinary URL selalu memiliki segmen '/upload/' sebelum versi/folder
        const parts = url.split('/upload/');
        if (parts.length !== 2) return null;

        const pathAndFile = parts[1];

        // Memecah path berdasarkan '/'
        const pathParts = pathAndFile.split('/');

        // Mengecek apakah segmen pertama adalah versi (dimulai dengan 'v' dan diikuti angka)
        if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
            pathParts.shift(); // Hapus segmen versi dari array
        }

        // Gabungkan kembali sisa path
        const cleanPath = pathParts.join('/');

        // Hapus ekstensi file (.jpg, .png, .webp, dll)
        const lastDotIndex = cleanPath.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            return cleanPath.substring(0, lastDotIndex);
        }

        return cleanPath;
    } catch (error: unknown) {
        console.error('[Cloudinary Utils] Error extracting public_id:', error);
        return null;
    }
}