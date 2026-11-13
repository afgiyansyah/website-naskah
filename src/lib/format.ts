import type { Scene } from "./types";

export function countWords(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

/** Perkiraan durasi baca (sekitar 2,7 kata per detik). */
export function estimateSeconds(scenes: Scene[]) {
  const words = scenes.reduce((n, s) => n + countWords(s.voiceover), 0);
  return Math.round(words / 2.7);
}

export function voiceoverText(scenes: Scene[]) {
  return scenes
    .map((s) => s.voiceover.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function scriptToText(
  title: string,
  scenes: Scene[],
  caption: string,
  hashtags: string[],
) {
  const body = scenes
    .map(
      (s) =>
        `[${s.label} | ${s.time}]\nVisual: ${s.visual}\nNarasi: ${s.voiceover}\nTeks layar: ${s.text}`,
    )
    .join("\n\n");
  return `JUDUL: ${title}\n\n${body}\n\nCAPTION:\n${caption}\n\n${hashtags.join(" ")}`;
}
