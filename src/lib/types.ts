export type Scene = {
  label: string;
  time: string;
  visual: string;
  voiceover: string;
  text: string;
};

export type ScriptData = {
  title: string;
  scenes: Scene[];
  caption: string;
  hashtags: string[];
};

export type Idea = {
  title: string;
  formula: string;
  angle: string;
};

export type TitlePack = {
  titles: string[];
  hooks: string[];
  hashtags: string[];
  caption: string;
};

export const TONES = [
  { value: "santai", label: "Santai & akrab" },
  { value: "semangat", label: "Semangat & energik" },
  { value: "profesional", label: "Profesional & tegas" },
  { value: "humor", label: "Humor & receh" },
  { value: "emosional", label: "Emosional & personal" },
] as const;

export const FORMULAS = [
  { value: "tips", label: "Tips Cepat", desc: "Daftar poin singkat yang mudah diingat" },
  { value: "mitos", label: "Mitos vs Fakta", desc: "Bongkar kesalahpahaman umum" },
  { value: "cerita", label: "Storytelling", desc: "Masalah, titik balik, lalu hasil" },
  { value: "tutorial", label: "Tutorial Langkah", desc: "Panduan langkah demi langkah" },
  { value: "beforeafter", label: "Sebelum & Sesudah", desc: "Perbandingan perubahan" },
  { value: "opini", label: "Opini Berani", desc: "Sudut pandang yang memancing diskusi" },
] as const;

export const DURATIONS = [15, 30, 45, 60] as const;

export const STATUSES = [
  { value: "ide", label: "Ide", color: "bg-amber-100 text-amber-800" },
  { value: "naskah", label: "Naskah", color: "bg-sky-100 text-sky-800" },
  { value: "produksi", label: "Produksi", color: "bg-violet-100 text-violet-800" },
  { value: "siap", label: "Siap Upload", color: "bg-emerald-100 text-emerald-800" },
  { value: "tayang", label: "Sudah Tayang", color: "bg-rose-100 text-rose-800" },
] as const;

export function statusLabel(v: string) {
  return STATUSES.find((s) => s.value === v)?.label ?? v;
}
