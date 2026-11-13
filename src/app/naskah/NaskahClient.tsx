"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { btnGhost, btnPrimary, Card, CopyButton, Field, inputCls, ModeBadge } from "@/components/ui";
import { estimateSeconds, scriptToText, voiceoverText } from "@/lib/format";
import { DURATIONS, FORMULAS, TONES, type Scene, type ScriptData } from "@/lib/types";

const LABEL_COLOR = (l: string) =>
  l === "HOOK" ? "bg-red-600 text-white" : l === "CTA" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-white";

export default function NaskahClient() {
  const params = useSearchParams();
  const router = useRouter();
  const idParam = params.get("id");
  const titleParam = params.get("judul");

  const [title, setTitle] = useState(titleParam ?? "");
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("santai");
  const [formula, setFormula] = useState("tips");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [savedId, setSavedId] = useState<number | null>(idParam ? Number(idParam) : null);
  const [status, setStatus] = useState("ide");

  useEffect(() => {
    fetch("/api/generate")
      .then((r) => r.json())
      .then((d) => setMode(d.mode))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!idParam) return;
    fetch(`/api/scripts/${idParam}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!s) return;
        setTitle(s.title);
        setNiche(s.niche);
        setTone(s.tone);
        setFormula(s.formula);
        setDuration(s.duration);
        setScenes(s.scenes);
        setCaption(s.caption);
        setHashtags((s.hashtags as string[]).join(" "));
        setStatus(s.status);
        setSavedId(s.id);
      })
      .catch(() => {});
  }, [idParam]);

  const generate = useCallback(async () => {
    if (!title.trim()) {
      setError("Tulis dulu judul atau topik videonya.");
      return;
    }
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "script", title, niche, tone, formula, duration }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat naskah");
      const data = json.data as ScriptData;
      setMode(json.mode);
      setScenes(data.scenes);
      setCaption(data.caption);
      setHashtags(data.hashtags.join(" "));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [title, niche, tone, formula, duration]);

  const updateScene = (i: number, patch: Partial<Scene>) =>
    setScenes((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const tags = hashtags.split(/\s+/).filter(Boolean);

  async function save() {
    setMsg("");
    setError("");
    const nextStatus = status === "ide" ? "naskah" : status;
    const payload = { title, niche, tone, formula, duration, scenes, caption, hashtags: tags, status: nextStatus };
    const res = await fetch(savedId ? `/api/scripts/${savedId}` : "/api/scripts", {
      method: savedId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Gagal menyimpan");
      return;
    }
    setSavedId(json.id);
    setStatus(json.status);
    setMsg("Tersimpan ke Planner ✓");
    if (!savedId) router.replace(`/naskah?id=${json.id}`);
  }

  const est = estimateSeconds(scenes);
  const overTime = est > duration + 3;

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Buat Naskah</h1>
            <ModeBadge mode={mode} />
          </div>
          <Field label="Judul / topik / prompt" hint="Contoh: 5 tips hemat listrik untuk anak kos">
            <textarea
              className={inputCls}
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tulis judul atau ide videomu..."
            />
          </Field>
          <Field label="Niche (opsional)">
            <input className={inputCls} value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="mis. keuangan, masak, gadget" />
          </Field>
          <Field label="Formula konten">
            <select className={inputCls} value={formula} onChange={(e) => setFormula(e.target.value)}>
              {FORMULAS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label} - {f.desc}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gaya bahasa">
            <select className={inputCls} value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Durasi">
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`rounded-lg border py-2 text-sm font-semibold ${
                    duration === d ? "border-red-600 bg-red-50 text-red-700" : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </Field>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className={`${btnPrimary} w-full`} onClick={generate} disabled={loading}>
            {loading ? "Menulis naskah..." : scenes.length ? "↻ Buat Ulang Naskah" : "✨ Buat Naskah"}
          </button>
        </Card>
      </aside>

      <section className="space-y-4">
        {scenes.length === 0 ? (
          <Card className="grid min-h-[320px] place-items-center text-center">
            <div className="max-w-sm">
              <div className="text-5xl">🎬</div>
              <h2 className="mt-3 text-lg font-bold">Naskahmu akan muncul di sini</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Tulis judul di sebelah kiri, pilih formula dan durasi, lalu klik <b>Buat Naskah</b>. Semua bagian bisa kamu edit setelahnya.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <Card className="flex flex-wrap items-center gap-2">
              <div className="mr-auto">
                <p className="text-sm font-semibold">{title}</p>
                <p className={`text-xs ${overTime ? "text-amber-600" : "text-zinc-500"}`}>
                  Perkiraan durasi narasi ±{est} detik dari target {duration} detik
                  {overTime && " - agak panjang, coba dipersingkat"}
                </p>
              </div>
              <button className={btnPrimary} onClick={save}>
                💾 {savedId ? "Simpan Perubahan" : "Simpan ke Planner"}
              </button>
              <CopyButton text={scriptToText(title, scenes, caption, tags)} label="Salin Semua" />
              <CopyButton text={voiceoverText(scenes)} label="Salin Narasi" />
              {savedId && (
                <Link href={`/teleprompter/${savedId}`} className={btnGhost}>
                  📜 Teleprompter
                </Link>
              )}
            </Card>
            {msg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            {scenes.map((s, i) => (
              <Card key={i} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${LABEL_COLOR(s.label)}`}>{s.label}</span>
                  <input
                    className="w-28 rounded border border-transparent px-1 text-xs text-zinc-500 hover:border-zinc-300 focus:border-red-400 focus:outline-none"
                    value={s.time}
                    onChange={(e) => updateScene(i, { time: e.target.value })}
                  />
                  <button
                    className="ml-auto text-xs text-zinc-400 hover:text-red-600"
                    onClick={() => setScenes((p) => p.filter((_, idx) => idx !== i))}
                  >
                    Hapus adegan
                  </button>
                </div>
                <Field label="Narasi / voice over">
                  <textarea className={inputCls} rows={3} value={s.voiceover} onChange={(e) => updateScene(i, { voiceover: e.target.value })} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Arahan visual">
                    <textarea className={inputCls} rows={2} value={s.visual} onChange={(e) => updateScene(i, { visual: e.target.value })} />
                  </Field>
                  <Field label="Teks di layar">
                    <textarea className={inputCls} rows={2} value={s.text} onChange={(e) => updateScene(i, { text: e.target.value })} />
                  </Field>
                </div>
              </Card>
            ))}
            <button
              className={btnGhost}
              onClick={() =>
                setScenes((p) => {
                  const copy = [...p];
                  copy.splice(Math.max(copy.length - 1, 1), 0, {
                    label: `ISI ${copy.length - 1}`,
                    time: "",
                    visual: "",
                    voiceover: "",
                    text: "",
                  });
                  return copy;
                })
              }
            >
              + Tambah adegan
            </button>

            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Caption & Hashtag</h3>
                <CopyButton text={`${caption}\n\n${tags.join(" ")}`} label="Salin" />
              </div>
              <textarea className={inputCls} rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} />
              <input className={inputCls} value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
            </Card>
          </>
        )}
      </section>
    </div>
  );
}
