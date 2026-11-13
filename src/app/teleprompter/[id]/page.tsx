"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { voiceoverText } from "@/lib/format";
import type { Scene } from "@/lib/types";

export default function TeleprompterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(40);
  const [size, setSize] = useState(44);
  const [mirror, setMirror] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    fetch(`/api/scripts/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s: { title: string; scenes: Scene[] }) => {
        setTitle(s.title);
        setText(voiceoverText(s.scenes));
      })
      .catch(() => setError("Naskah tidak ditemukan."));
  }, [id]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let pos = boxRef.current?.scrollTop ?? 0;
    const tick = (now: number) => {
      const el = boxRef.current;
      if (!el) return;
      pos += ((now - last) / 1000) * speedRef.current;
      last = now;
      el.scrollTop = pos;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">
        <Link href={`/naskah?id=${id}`} className="rounded-lg bg-zinc-800 px-3 py-1.5 hover:bg-zinc-700">
          ← Kembali
        </Link>
        <span className="mr-auto max-w-xs truncate font-semibold">{title}</span>
        <button
          onClick={() => {
            if (!playing && boxRef.current) {
              const el = boxRef.current;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) el.scrollTop = 0;
            }
            setPlaying((p) => !p);
          }}
          className="rounded-lg bg-red-600 px-4 py-1.5 font-semibold hover:bg-red-700"
        >
          {playing ? "⏸ Jeda" : "▶ Mulai"}
        </button>
        <button onClick={() => { setPlaying(false); if (boxRef.current) boxRef.current.scrollTop = 0; }} className="rounded-lg bg-zinc-800 px-3 py-1.5 hover:bg-zinc-700">
          ⟲ Ulang
        </button>
        <label className="flex items-center gap-2">
          Kecepatan
          <input type="range" min={10} max={150} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2">
          Ukuran
          <input type="range" min={24} max={96} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} />
          Cermin
        </label>
      </div>
      {error ? (
        <p className="p-8 text-center text-zinc-400">{error}</p>
      ) : (
        <div ref={boxRef} className="relative flex-1 overflow-y-auto px-6">
          <div
            className="mx-auto max-w-3xl whitespace-pre-line text-center font-semibold leading-snug"
            style={{
              fontSize: size,
              paddingTop: "40vh",
              paddingBottom: "70vh",
              transform: mirror ? "scaleX(-1)" : undefined,
            }}
          >
            {text}
          </div>
          <div className="pointer-events-none fixed inset-x-0 top-[calc(40vh+40px)] h-px bg-red-600/60" />
        </div>
      )}
    </div>
  );
}
