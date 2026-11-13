import type { SceneRow, scripts } from "@/db/schema";

type Fields = Partial<typeof scripts.$inferInsert>;

const STATUS = ["ide", "naskah", "produksi", "siap", "tayang"];

/** Ambil & validasi field naskah dari body request (hanya field yang dikirim). */
export function pickScriptFields(body: unknown): Fields | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const f: Fields = {};
  if (typeof b.title === "string") f.title = b.title.trim().slice(0, 300);
  if (typeof b.niche === "string") f.niche = b.niche.slice(0, 100);
  if (typeof b.tone === "string") f.tone = b.tone.slice(0, 30);
  if (typeof b.formula === "string") f.formula = b.formula.slice(0, 30);
  if (typeof b.duration === "number") f.duration = Math.round(b.duration);
  if (typeof b.caption === "string") f.caption = b.caption.slice(0, 5000);
  if (typeof b.status === "string" && STATUS.includes(b.status)) f.status = b.status;
  if (b.scheduledDate === null) f.scheduledDate = null;
  else if (typeof b.scheduledDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.scheduledDate)) {
    f.scheduledDate = b.scheduledDate;
  } else if (b.scheduledDate === "") f.scheduledDate = null;
  if (Array.isArray(b.hashtags)) {
    f.hashtags = b.hashtags.filter((x): x is string => typeof x === "string").slice(0, 30);
  }
  if (Array.isArray(b.scenes)) {
    f.scenes = (b.scenes as Record<string, unknown>[])
      .slice(0, 20)
      .map((s) => ({
        label: String(s?.label ?? ""),
        time: String(s?.time ?? ""),
        visual: String(s?.visual ?? ""),
        voiceover: String(s?.voiceover ?? ""),
        text: String(s?.text ?? ""),
      })) satisfies SceneRow[];
  }
  return f;
}
