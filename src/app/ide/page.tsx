"use client";

import Link from "next/link";
import { useState } from "react";
import { btnGhost, btnPrimary, Card, Field, inputCls, ModeBadge } from "@/components/ui";
import { FORMULAS, type Idea } from "@/lib/types";

export default function IdePage() {
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!niche.trim()) {
      setError("Isi dulu niche atau topik kamu.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ideas", niche, count: 12 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal");
      setIdeas(json.data);
      setMode(json.mode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function saveIdea(idea: Idea) {
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: idea.title, niche, formula: idea.formula, status: "ide" }),
    });
    if (res.ok) setSaved((p) => new Set(p).add(idea.title));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generator Ide Konten</h1>
        <p className="text-sm text-zinc-500">Bingung mau bikin Shorts apa? Masukkan niche, dapatkan belasan ide sekaligus.</p>
      </div>
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Niche / topik">
            <input
              className={inputCls}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="mis. investasi saham pemula, resep masakan, edit video"
            />
          </Field>
        </div>
        <button className={btnPrimary} onClick={generate} disabled={loading}>
          {loading ? "Mencari ide..." : ideas.length ? "↻ Acak Ide Baru" : "💡 Cari Ide"}
        </button>
      </Card>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ideas.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{ideas.length} ide untuk &quot;{niche}&quot;</h2>
            <ModeBadge mode={mode} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ideas.map((idea) => (
              <Card key={idea.title} className="flex flex-col gap-3">
                <div>
                  <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                    {FORMULAS.find((f) => f.value === idea.formula)?.label ?? idea.formula}
                  </span>
                  <h3 className="mt-2 font-semibold leading-snug">{idea.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{idea.angle}</p>
                </div>
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/naskah?judul=${encodeURIComponent(idea.title)}`}
                    className={btnPrimary}
                  >
                    Tulis naskah
                  </Link>
                  <button className={btnGhost} onClick={() => saveIdea(idea)} disabled={saved.has(idea.title)}>
                    {saved.has(idea.title) ? "✓ Tersimpan" : "Simpan ide"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
