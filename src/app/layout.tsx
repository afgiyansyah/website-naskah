import type { Metadata } from "next";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShortsPilot - Asisten Konten YouTube Shorts",
  description:
    "Buat naskah, ide, judul, hook, dan hashtag YouTube Shorts dengan cepat. Lengkap dengan planner dan teleprompter.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
