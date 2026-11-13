"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { btnGhost, btnPrimary, Card, inputCls } from "@/components/ui";
import { STATUSES } from "@/lib/types";

type Item = {
  id: number;
  title: string;
  duration: number;
  status: string;
  scheduledDate: string | null;
  scenes: unknown[];
};

export default function PlannerPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [quick, setQuick] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/scripts");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(id: number, body: Record<string, unknown>) {
    setItems((p) => p.map((i) => (i.id === id ? ({ ...i, ...body } as Item) : i)));
    await fetch(`/api/scripts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function remove(id: number) {
    if (!confirm("Hapus item ini?")) return;
    setItems((p) => p.filter((i) => i.id !== id));
    await fetch(`/api/scripts/${id}`, { method: "DELETE" });
  }

  async function addQuick() {
    if (!quick.trim()) return;
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: quick, status: "ide" }),
    });
    if (res.ok) {
      setQuick("");
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planner Konten</h1>
        <p className="text-sm text-zinc-500">Pantau progres setiap video Shorts dari ide sampai tayang.</p>
      </div>
      <Card className="flex flex-col gap-2 sm:flex-row">
        <input
          className={inputCls}
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addQuick()}
          placeholder="Catat ide cepat, lalu tekan Enter..."
        />
        <button className={btnPrimary} onClick={addQuick}>
          + Tambah Ide
        </button>
      </Card>

      {loading ? (
        <p className="text-sm text-zinc-500">Memuat...</p>
      ) : items.length === 0 ? (
        <Card className="text-center text-sm text-zinc-500">
          Belum ada konten. Tambah ide di atas, atau{" "}
          <Link href="/naskah" className="font-semibold text-red-600">
            buat naskah pertamamu
          </Link>
          .
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {STATUSES.map((st) => {
            const col = items.filter((i) => i.status === st.value);
            return (
              <div key={st.value} className="space-y-3 rounded-2xl bg-zinc-100 p-3">
                <div className="flex items-center justify-between px-1">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${st.color}`}>{st.label}</span>
                  <span className="text-xs text-zinc-500">{col.length}</span>
                </div>
                {col.map((i) => (
                  <div key={i.id} className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold leading-snug">{i.title}</p>
                    <p className="text-xs text-zinc-400">
                      {i.scenes.length ? `${i.scenes.length} adegan · ${i.duration}s` : "Belum ada naskah"}
                    </p>
                    <input
                      type="date"
                      className={`${inputCls} !py-1 text-xs`}
                      value={i.scheduledDate ?? ""}
                      onChange={(e) => patch(i.id, { scheduledDate: e.target.value || null })}
                      title="Jadwal upload"
                    />
                    <select
                      className={`${inputCls} !py-1 text-xs`}
                      value={i.status}
                      onChange={(e) => patch(i.id, { status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-1.5">
                      <Link href={`/naskah?id=${i.id}`} className={`${btnGhost} !px-2 !py-1 text-xs`}>
                        {i.scenes.length ? "Buka" : "Tulis naskah"}
                      </Link>
                      {i.scenes.length > 0 && (
                        <Link href={`/teleprompter/${i.id}`} className={`${btnGhost} !px-2 !py-1 text-xs`}>
                          📜
                        </Link>
                      )}
                      <button className={`${btnGhost} !px-2 !py-1 text-xs hover:!text-red-600`} onClick={() => remove(i.id)}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
