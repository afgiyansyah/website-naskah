// Lapisan AI opsional (kompatibel OpenAI). Aktif jika LLM_API_KEY diisi.
// Opsional: LLM_BASE_URL (default https://api.openai.com/v1), LLM_MODEL (default gpt-4o-mini).

export function llmEnabled() {
  return Boolean(process.env.LLM_API_KEY);
}

export async function askJson(system: string, user: string): Promise<unknown | null> {
  const key = process.env.LLM_API_KEY;
  if (!key) return null;
  const base = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export const SYSTEM =
  "Kamu adalah asisten kreator konten YouTube Shorts berbahasa Indonesia. Tulis kreatif, ringkas, natural seperti orang bicara, dengan hook kuat di 3 detik pertama. Selalu balas HANYA dengan JSON valid.";
