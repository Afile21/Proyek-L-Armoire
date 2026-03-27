// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "../../../utils/authOptions"; // Mengambil konfigurasi yang kita buat di Fase 11.1

// Inisialisasi handler NextAuth dengan opsi yang sudah kita definisikan
const handler = NextAuth(authOptions);

// Next.js App Router mengharuskan kita mengekspor method HTTP secara eksplisit (GET dan POST)
export { handler as GET, handler as POST };