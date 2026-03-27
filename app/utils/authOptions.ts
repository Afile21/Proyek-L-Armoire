// app/utils/authOptions.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        // Membiarkan NextAuth menggunakan halaman login default yang minimalis untuk saat ini
        // signIn: '/auth/signin', 
    },
    callbacks: {
        async session({ session, token }) {
            // Menyisipkan ID user ke dalam session jika diperlukan di klien
            if (session.user && token.sub) {
                session.user.id = token.sub; // Tidak perlu "as any" lagi
            }
            return session;
        }
    }
};