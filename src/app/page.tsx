import Link from "next/link";
import { desc, isNotNull, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { scripts } from "@/db/schema";
import { Card } from "@/components/ui";
import { STATUSES, statusLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

const TOOLS = [
  { href: "/naskah", icon: "📝", title: "Generator Naskah", desc: "Tulis judul, dapatkan naskah lengkap: hook, isi, CTA, arahan visual, dan teks layar." },
  { href: "/ide", icon: "💡", title: "Ide Konten", desc: "Masukkan niche, dapatkan belasan ide video Shorts siap dieksekusi." },
  { href: "/judul", icon: "🔥", title: "Judul, Hook & Hashtag", desc: "Variasi judul, hook 3 detik, caption, dan hashtag sekali klik." },
  { href: "/planner", icon: "🗂️", title: "Planner & Jadwal", desc: "Lacak progres dari ide sampai tayang dan atur jadwal upload." },
];

const TIPS = [
  "Hook di 3 detik pertama menentukan apakah orang lanjut menonton.",
  "Jaga satu ide per video. Shorts terbaik fokus pada satu pesan.",
  "Tambahkan teks di layar karena banyak orang menonton tanpa suara.",
  "Akhiri video agar nyambung ke awal supaya penonton mengulang (loop).",
  "Upload konsisten lebih penting daripada sempurna.",
];

export default async function HomePage() {
  const all = await db.select().from(scripts).orderBy(desc(scripts.updatedAt));
  const counts = Object.fromEntries(STATUSES.map((s) => [s.value, all.filter((a) => a.status === s.value).length]));
  const recent = all.slice(0, 5);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (
    await db
      .select()
      .from(scripts)
      .where(and(isNotNull(scripts.scheduledDate), ne(scripts.status, "tayang")))
  )
    .filter((s) => (s.scheduledDate ?? "") >= today)
    .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""))
    .slice(0, 5);
  const tip = TIPS[new Date().getDate() % TIPS.length];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-600 to-rose-700 p-8 text-white shadow-lg sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-100">Asisten kreator Shorts</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Bikin YouTube Shorts lebih cepat, tanpa pusing mikir naskah.
        </h1>
        <p className="mt-4 max-w-xl text-red-50">
          Tulis judul atau ide videomu, ShortsPilot menyusun naskah, hook, hashtag, sampai teleprompter untuk rekaman.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/naskah" className="rounded-xl bg-white px-5 py-3 font-bold text-red-700 shadow hover:bg-red-50">
            ✨ Buat Naskah Sekarang
          </Link>
          <Link href="/ide" className="rounded-xl border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">
            Cari Ide Konten
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md">
            <div className="text-3xl">{t.icon}</div>
            <h2 className="mt-3 font-bold group-hover:text-red-600">{t.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t.desc}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold">Progres Konten</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {STATUSES.map((s) => (
              <div key={s.value} className="rounded-xl bg-zinc-50 p-3 text-center">
                <p className="text-2xl font-extrabold">{counts[s.value]}</p>
                <p className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</p>
              </div>
            ))}
          </div>
          <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-500">Terakhir diubah</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada konten. Mulai dengan membuat naskah pertamamu!</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/naskah?id=${r.id}`} className="flex items-center justify-between gap-3 py-2 text-sm hover:text-red-600">
                    <span className="truncate font-medium">{r.title}</span>
                    <span className="shrink-0 text-xs text-zinc-400">{statusLabel(r.status)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-bold">Jadwal Upload</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-500">Belum ada jadwal. Atur tanggal di Planner.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {upcoming.map((u) => (
                  <li key={u.id} className="flex justify-between gap-3">
                    <span className="truncate">{u.title}</span>
                    <span className="shrink-0 font-semibold text-red-600">{u.scheduledDate}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="bg-amber-50">
            <h2 className="mb-1 font-bold">💡 Tips hari ini</h2>
            <p className="text-sm text-zinc-700">{tip}</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
