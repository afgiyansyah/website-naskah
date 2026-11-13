"use client";

import Link from "next/link";
import { useState } from "react";
import { btnPrimary, Card, CopyButton, Field, inputCls, ModeBadge } from "@/components/ui";
import { TONES, type TitlePack } from "@/lib/types";

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h2 className="mb-3 font-bold">{title}</h2>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it} className="flex items-start justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm">
            <span>{it}</span>
            <span className="flex shrink-0 items-center gap-2">
              {title.startsWith("Judul") && (
                <Link href={`/naskah?judul=${encodeURIComponent(it)}`} className="text-xs font-semibold text-red-600 hover:underline">
                  Tulis naskah
                </Link>
              )}
              <CopyButton text={it} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900" />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function JudulPage() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("santai");
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<TitlePack | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!topic.trim()) {
      setError("Isi dulu topik videonya.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "titles", topic, niche, tone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal");
      setPack(json.data);
      setMode(json.mode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Judul, Hook & Hashtag</h1>
        <p className="text-sm text-zinc-500">Dapatkan variasi judul, kalimat pembuka 3 detik, caption, dan hashtag untuk topikmu.</p>
      </div>
      <Card className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
        <Field label="Topik video">
          <input
            className={inputCls}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="mis. cara menabung gaji UMR"
          />
        </Field>
        <Field label="Niche (opsional)">
          <input className={inputCls} value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="keuangan" />
        </Field>
        <Field label="Gaya">
          <select className={inputCls} value={tone} onChange={(e) => setTone(e.target.value)}>
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <button className={btnPrimary} onClick={generate} disabled={loading}>
          {loading ? "Memproses..." : pack ? "↻ Acak" : "✨ Buat"}
        </button>
      </Card>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {pack && (
        <>
          <div>
            <ModeBadge mode={mode} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <List title="Judul alternatif" items={pack.titles} />
            <List title="Hook 3 detik pertama" items={pack.hooks} />
          </div>
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Caption & Hashtag</h2>
              <CopyButton text={`${pack.caption}\n\n${pack.hashtags.join(" ")}`} label="Salin semua" />
            </div>
            <p className="whitespace-pre-line rounded-lg bg-zinc-50 p-3 text-sm">{pack.caption}</p>
            <div className="flex flex-wrap gap-2">
              {pack.hashtags.map((h) => (
                <span key={h} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  {h}
                </span>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
