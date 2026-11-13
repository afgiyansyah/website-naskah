import { NextResponse } from "next/server";
import {
  generateIdeas,
  generateScript,
  generateTitlePack,
  makeCaption,
  makeHashtags,
} from "@/lib/generator";
import { askJson, llmEnabled, SYSTEM } from "@/lib/llm";
import type { Idea, Scene, ScriptData, TitlePack } from "@/lib/types";

export const dynamic = "force-dynamic";

const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const strArr = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export async function GET() {
  return NextResponse.json({ mode: llmEnabled() ? "ai" : "template" });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });

  const type = str(body.type);
  const mode = llmEnabled() ? "ai" : "template";

  if (type === "script") {
    const title = str(body.title).trim();
    if (!title) return NextResponse.json({ error: "Judul/topik wajib diisi" }, { status: 400 });
    const input = {
      title,
      niche: str(body.niche),
      tone: str(body.tone, "santai"),
      formula: str(body.formula, "tips"),
      duration: Number(body.duration) || 30,
    };

    if (llmEnabled()) {
      const raw = (await askJson(
        SYSTEM,
        `Buat naskah YouTube Shorts.
Judul/topik/prompt: ${input.title}
Niche: ${input.niche || "umum"}
Gaya bahasa: ${input.tone}
Formula: ${input.formula}
Durasi total: ${input.duration} detik (sekitar ${Math.round(input.duration * 2.6)} kata narasi).
Balas JSON: {"title": string, "scenes": [{"label": "HOOK"|"ISI 1"|...|"CTA", "time": "0-3 dtk", "visual": string, "voiceover": string, "text": string}], "caption": string, "hashtags": [string]}
Scene pertama HOOK, terakhir CTA, hashtags diawali #.`,
      )) as Record<string, unknown> | null;
      if (raw && Array.isArray(raw.scenes) && raw.scenes.length >= 2) {
        const scenes: Scene[] = (raw.scenes as Record<string, unknown>[]).map((s, i) => ({
          label: str(s.label, `ISI ${i}`),
          time: str(s.time),
          visual: str(s.visual),
          voiceover: str(s.voiceover),
          text: str(s.text),
        }));
        const data: ScriptData = {
          title: str(raw.title, title),
          scenes,
          caption: str(raw.caption, makeCaption(title)),
          hashtags: strArr(raw.hashtags).length ? strArr(raw.hashtags) : makeHashtags(title, input.niche),
        };
        return NextResponse.json({ mode: "ai", data });
      }
    }
    return NextResponse.json({ mode: "template", data: generateScript(input) });
  }

  if (type === "ideas") {
    const niche = str(body.niche).trim();
    if (!niche) return NextResponse.json({ error: "Niche/topik wajib diisi" }, { status: 400 });
    const count = Math.min(Math.max(Number(body.count) || 10, 3), 18);

    if (llmEnabled()) {
      const raw = (await askJson(
        SYSTEM,
        `Berikan ${count} ide konten YouTube Shorts untuk niche: ${niche}.
Balas JSON: {"ideas": [{"title": string, "formula": "tips"|"mitos"|"cerita"|"tutorial"|"beforeafter"|"opini", "angle": string}]}`,
      )) as { ideas?: Record<string, unknown>[] } | null;
      if (raw && Array.isArray(raw.ideas) && raw.ideas.length) {
        const ideas: Idea[] = raw.ideas.map((i) => ({
          title: str(i.title),
          formula: str(i.formula, "tips"),
          angle: str(i.angle),
        }));
        return NextResponse.json({ mode: "ai", data: ideas.filter((i) => i.title) });
      }
    }
    return NextResponse.json({ mode: "template", data: generateIdeas(niche, count) });
  }

  if (type === "titles") {
    const topic = str(body.topic).trim();
    if (!topic) return NextResponse.json({ error: "Topik wajib diisi" }, { status: 400 });
    const tone = str(body.tone, "santai");
    const niche = str(body.niche);

    if (llmEnabled()) {
      const raw = (await askJson(
        SYSTEM,
        `Topik video Shorts: ${topic}. Niche: ${niche || "umum"}. Gaya: ${tone}.
Balas JSON: {"titles": [10 judul menarik maks 70 karakter], "hooks": [6 kalimat pembuka 3 detik pertama], "hashtags": [8 hashtag diawali #], "caption": string}`,
      )) as Record<string, unknown> | null;
      if (raw && strArr(raw.titles).length) {
        const data: TitlePack = {
          titles: strArr(raw.titles),
          hooks: strArr(raw.hooks),
          hashtags: strArr(raw.hashtags),
          caption: str(raw.caption, makeCaption(topic)),
        };
        return NextResponse.json({ mode: "ai", data });
      }
    }
    return NextResponse.json({ mode: "template", data: generateTitlePack(topic, tone, niche) });
  }

  return NextResponse.json({ error: "Tipe tidak dikenal", mode }, { status: 400 });
}
