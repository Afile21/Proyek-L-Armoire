// middleware.ts
export { default } from "next-auth/middleware";

// Tentukan rute mana saja yang HARUS dikunci (membutuhkan login)
export const config = {
    matcher: [
        "/add",
        "/lookbook"
        // Anda bisa menambahkan rute lain di sini nanti, misalnya "/settings" atau "/profile"
    ],
};