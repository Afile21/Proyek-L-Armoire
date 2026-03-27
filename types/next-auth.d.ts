import { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Mengembalikan `id` ke dalam session.user
     */
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}