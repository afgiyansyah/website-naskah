"use client";

import { useState, type ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60";

export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}
    </label>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function CopyButton({ text, label = "Salin", className = btnGhost }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "✓ Tersalin" : label}
    </button>
  );
}

export function ModeBadge({ mode }: { mode: string | null }) {
  if (!mode) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        mode === "ai" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-600"
      }`}
      title={mode === "ai" ? "Dibantu AI" : "Mesin template bawaan (isi LLM_API_KEY untuk mode AI)"}
    >
      {mode === "ai" ? "Mode AI" : "Mode Template"}
    </span>
  );
}
