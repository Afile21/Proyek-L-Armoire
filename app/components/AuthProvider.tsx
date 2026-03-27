// app/components/AuthProvider.tsx
"use client"; // Wajib ditambahkan karena SessionProvider membutuhkan React Context yang berjalan di sisi client

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}