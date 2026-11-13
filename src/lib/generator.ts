import type { Idea, Scene, ScriptData, TitlePack } from "./types";

const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const fill = (s: string, t: string) => s.replaceAll("{t}", t);
const shuffle = <T>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

type ToneSet = { hooks: string[]; ctas: string[] };

const TONE: Record<string, ToneSet> = {
  santai: {
    hooks: [
      "Guys, ada yang mau aku bocorin soal {t}.",
      "Jujur ya, dulu aku juga nggak tahu soal {t}.",
      "Bentar deh, kamu udah tahu belum soal {t}?",
    ],
    ctas: [
      "Kalau bermanfaat, like dan subscribe ya, biar nggak ketinggalan tips lainnya!",
      "Simpan video ini biar nggak lupa, terus tulis di komentar topik yang mau kamu lihat berikutnya!",
    ],
  },
  semangat: {
    hooks: [
      "Stop scroll! Kamu wajib tahu soal {t}!",
      "Siap-siap! Ini rahasia {t} yang bisa mengubah harimu!",
      "Yuk kita bahas {t} sampai tuntas dalam hitungan detik!",
    ],
    ctas: [
      "Langsung praktikkan sekarang! Subscribe dan nyalakan lonceng supaya kamu nggak ketinggalan!",
      "Kamu pasti bisa! Like, subscribe, dan bagikan ke temanmu yang butuh semangat ini!",
    ],
  },
  profesional: {
    hooks: [
      "Berikut hal penting tentang {t} yang perlu Anda ketahui.",
      "Jika Anda serius soal {t}, perhatikan poin-poin berikut.",
      "Ini inti dari {t} yang sering terlewatkan.",
    ],
    ctas: [
      "Jika konten ini bermanfaat, silakan subscribe untuk wawasan lainnya.",
      "Tuliskan pertanyaan Anda di kolom komentar, dan kami akan bahas di video berikutnya.",
    ],
  },
  humor: {
    hooks: [
      "Kalau {t} itu gampang, nggak bakal ada video ini. Tapi tenang, aku bantu.",
      "Plot twist: {t} ternyata nggak sesulit move on dari mantan.",
      "Aku kira {t} itu rumit, ternyata yang rumit cuma isi dompet akhir bulan.",
    ],
    ctas: [
      "Like dan subscribe dong, gratis kok, nggak kayak cicilan!",
      "Kalau kamu ketawa dikit aja, itu udah cukup alasan buat subscribe.",
    ],
  },
  emosional: {
    hooks: [
      "Dulu aku hampir menyerah gara-gara {t}.",
      "Kalau kamu lagi capek dengan {t}, dengarkan ini sampai habis.",
      "Ada satu hal soal {t} yang baru aku sadari belakangan.",
    ],
    ctas: [
      "Kalau ini menyentuhmu, bagikan ke seseorang yang sedang butuh mendengarnya.",
      "Terima kasih sudah menonton sampai akhir. Subscribe, kita belajar bareng pelan-pelan.",
    ],
  },
};

type Point = { vo: string; text: string };
type Formula = { hooks: string[]; points: Point[] };

const FORMULA: Record<string, Formula> = {
  tips: {
    hooks: [
      "Soal {t}, kebanyakan orang melewatkan hal ini.",
      "Cuma butuh beberapa detik untuk paham {t}. Simak ya.",
    ],
    points: [
      { vo: "Pertama, mulai dari dasarnya. Pahami dulu tujuanmu dengan {t}, supaya langkahmu nggak asal-asalan.", text: "1. Pahami tujuan" },
      { vo: "Kedua, mulai dari langkah kecil. Nggak perlu sempurna, yang penting konsisten menjalankan {t}.", text: "2. Mulai dari kecil" },
      { vo: "Ketiga, hindari kesalahan umum. Banyak orang gagal di {t} karena terlalu terburu-buru.", text: "3. Hindari kesalahan umum" },
      { vo: "Keempat, gunakan cara atau alat yang tepat. Satu trik sederhana bisa menghemat banyak waktu untuk {t}.", text: "4. Pakai trik yang tepat" },
      { vo: "Kelima, evaluasi hasilnya. Catat apa yang berhasil, lalu ulangi terus.", text: "5. Evaluasi & ulangi" },
    ],
  },
  mitos: {
    hooks: ["Mitos atau fakta? Ini kebenaran soal {t}."],
    points: [
      { vo: "Mitos pertama: {t} itu harus rumit dan mahal. Faktanya, kamu bisa mulai dengan cara yang sederhana.", text: "Mitos 1: Harus rumit & mahal" },
      { vo: "Mitos kedua: semua orang berhasil dengan cara yang sama. Faktanya, tiap orang butuh pendekatan berbeda.", text: "Mitos 2: Satu cara untuk semua" },
      { vo: "Mitos ketiga: hasilnya bisa instan. Faktanya, {t} butuh proses dan konsistensi.", text: "Mitos 3: Hasil instan" },
      { vo: "Mitos keempat: pemula pasti kesulitan. Faktanya, pemula justru cepat maju kalau tahu urutannya.", text: "Mitos 4: Pemula nggak bisa" },
      { vo: "Fakta terpentingnya: yang paling berpengaruh adalah kebiasaan kecil yang kamu ulang setiap hari.", text: "FAKTA: Kebiasaan kecil" },
    ],
  },
  cerita: {
    hooks: ["Ini cerita singkat tentang aku dan {t}."],
    points: [
      { vo: "Awalnya, aku merasa {t} itu berat dan membingungkan. Banyak hal yang kucoba justru gagal.", text: "Awalnya: berantakan" },
      { vo: "Lalu aku sadar, masalahnya bukan di usaha, tapi di caranya.", text: "Titik sadar" },
      { vo: "Titik baliknya: aku ubah satu kebiasaan kecil dan fokus ke hal yang paling berdampak.", text: "Titik balik" },
      { vo: "Hasilnya mulai terasa. Pelan-pelan, {t} jadi jauh lebih mudah.", text: "Hasilnya terasa" },
      { vo: "Pelajarannya: kamu nggak perlu hebat dulu untuk mulai. Kamu cuma perlu mulai.", text: "Pelajaran" },
    ],
  },
  tutorial: {
    hooks: ["Begini cara {t}, ikuti langkahnya satu per satu."],
    points: [
      { vo: "Langkah pertama, siapkan semua yang kamu butuhkan sebelum mulai {t}.", text: "Langkah 1: Persiapan" },
      { vo: "Langkah kedua, mulai dari bagian yang paling mudah dan jalankan pelan-pelan.", text: "Langkah 2: Mulai dari yang mudah" },
      { vo: "Langkah ketiga, cek hasilnya. Kalau ada yang kurang, perbaiki di bagian yang bermasalah.", text: "Langkah 3: Cek hasil" },
      { vo: "Langkah keempat, tambahkan sentuhan akhir supaya hasil {t} lebih rapi dan maksimal.", text: "Langkah 4: Sentuhan akhir" },
      { vo: "Langkah terakhir, simpan caranya dan ulangi supaya makin lancar.", text: "Langkah 5: Ulangi" },
    ],
  },
  beforeafter: {
    hooks: ["Sebelum dan sesudah paham {t}, bedanya jauh banget."],
    points: [
      { vo: "Sebelumnya, {t} terasa membingungkan dan memakan banyak waktu.", text: "SEBELUM" },
      { vo: "Banyak kesalahan terjadi karena aku nggak punya panduan yang jelas.", text: "Masalah utama" },
      { vo: "Lalu aku ubah pendekatannya jadi lebih terstruktur dan terukur.", text: "Perubahan" },
      { vo: "Sesudahnya, prosesnya lebih cepat dan hasilnya lebih terlihat.", text: "SESUDAH" },
      { vo: "Kuncinya satu: konsisten dan mau evaluasi.", text: "Kuncinya: konsisten" },
    ],
  },
  opini: {
    hooks: ["Unpopular opinion soal {t}."],
    points: [
      { vo: "Menurutku, kebanyakan orang salah kaprah soal {t}.", text: "Salah kaprah" },
      { vo: "Banyak yang ikut-ikutan tren tanpa tahu alasannya.", text: "Ikut tren tanpa paham" },
      { vo: "Padahal yang paling penting adalah menyesuaikan dengan kondisimu sendiri.", text: "Sesuaikan dengan dirimu" },
      { vo: "Jadi jangan telan mentah-mentah saran siapa pun, termasuk aku.", text: "Jangan telan mentah-mentah" },
      { vo: "Coba, uji, lalu pilih yang paling cocok denganmu.", text: "Coba & pilih" },
    ],
  },
};

const BODY_VISUALS = [
  "Talking head, teks poin besar di layar",
  "B-roll yang relevan dengan topik + narasi",
  "Screen recording / demo singkat",
  "Potongan cepat, zoom-in di kata kunci",
  "Close-up objek + teks animasi",
];

const STOP = new Set([
  "yang", "dan", "untuk", "dengan", "dari", "cara", "tips", "ini", "itu", "atau", "pada",
  "dalam", "agar", "supaya", "kamu", "aku", "saya", "anda", "tanpa", "lebih", "bisa",
  "akan", "jadi", "soal", "tentang", "bikin", "yang", "banget", "sebelum", "sesudah",
]);

function keywords(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w));
}

export function makeHashtags(title: string, niche = ""): string[] {
  const tags: string[] = [];
  const kws = Array.from(new Set(keywords(title))).slice(0, 3);
  kws.forEach((k) => tags.push(`#${k}`));
  const n = niche.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  if (n) tags.push(`#${n.replace(/\s+/g, "")}`);
  tags.push("#shorts", "#youtubeshorts", "#fyp", "#tipsharian");
  return Array.from(new Set(tags)).slice(0, 8);
}

export function makeCaption(title: string) {
  return `${title} ✨\n\nSimpan video ini biar nggak lupa dan kirim ke temanmu yang butuh! Menurutmu bagian mana yang paling berguna? Tulis di komentar 👇`;
}

const BODY_COUNT: Record<number, number> = { 15: 1, 30: 3, 45: 4, 60: 5 };

export function generateScript(input: {
  title: string;
  niche?: string;
  tone: string;
  formula: string;
  duration: number;
}): ScriptData {
  const t = input.title.trim();
  const tone = TONE[input.tone] ?? TONE.santai;
  const formula = FORMULA[input.formula] ?? FORMULA.tips;
  const n = BODY_COUNT[input.duration] ?? 3;
  const hookLen = 3;
  const ctaLen = input.duration <= 15 ? 3 : 5;
  const per = Math.floor((input.duration - hookLen - ctaLen) / n);

  let hook = fill(pick([...tone.hooks, ...formula.hooks]), t);
  if (input.niche?.trim() && Math.random() < 0.4) {
    hook = `Buat kamu yang suka ${input.niche.trim()}: ${hook}`;
  }

  const scenes: Scene[] = [
    {
      label: "HOOK",
      time: `0-${hookLen} dtk`,
      visual: "Close-up wajah, ekspresi penasaran, teks hook besar. Langsung tanpa intro.",
      voiceover: hook,
      text: t.length > 45 ? t.slice(0, 42) + "..." : t,
    },
  ];

  const startIdx = n === 1 ? 2 : 0;
  const vis = shuffle(BODY_VISUALS);
  let cursor = hookLen;
  for (let i = 0; i < n; i++) {
    const p = formula.points[(startIdx + i) % formula.points.length];
    const end = i === n - 1 ? input.duration - ctaLen : cursor + per;
    scenes.push({
      label: `ISI ${i + 1}`,
      time: `${cursor}-${end} dtk`,
      visual: vis[i % vis.length],
      voiceover: fill(p.vo, t),
      text: p.text,
    });
    cursor = end;
  }

  scenes.push({
    label: "CTA",
    time: `${input.duration - ctaLen}-${input.duration} dtk`,
    visual: "Tunjuk ke bawah / tombol subscribe, senyum. Akhiri agar nyambung ke awal video (loop).",
    voiceover: pick(tone.ctas),
    text: "Subscribe & komen 👇",
  });

  return {
    title: t,
    scenes,
    caption: makeCaption(t),
    hashtags: makeHashtags(t, input.niche),
  };
}

const IDEA_PATTERNS: { t: string; f: string }[] = [
  { t: "5 kesalahan {n} yang sering dilakukan pemula", f: "tips" },
  { t: "Mitos {n} yang ternyata salah besar", f: "mitos" },
  { t: "Cara {n} dalam 30 detik", f: "tutorial" },
  { t: "{n}: dulu vs sekarang", f: "beforeafter" },
  { t: "Rahasia {n} yang jarang dibahas orang", f: "tips" },
  { t: "Cerita pertama kali aku mencoba {n}", f: "cerita" },
  { t: "Unpopular opinion tentang {n}", f: "opini" },
  { t: "3 alat gratis yang membantu {n}", f: "tips" },
  { t: "Tantangan 7 hari {n}, ini hasilnya", f: "cerita" },
  { t: "Pertanyaan paling sering soal {n}, kujawab singkat", f: "tips" },
  { t: "Cara salah vs cara benar {n}", f: "beforeafter" },
  { t: "Hal yang kusesali sebelum memulai {n}", f: "cerita" },
  { t: "{n} untuk pemula: mulai dari mana?", f: "tutorial" },
  { t: "Kenapa {n} bikin kamu gagal terus (dan solusinya)", f: "tips" },
  { t: "Biaya sebenarnya {n} yang jarang diungkap", f: "opini" },
  { t: "Cek fakta: tren {n} yang lagi ramai", f: "mitos" },
  { t: "1 trik {n} yang bisa dicoba hari ini", f: "tutorial" },
  { t: "Checklist {n} sebelum kamu mulai", f: "tips" },
];

const ANGLE: Record<string, string> = {
  tips: "Format daftar poin singkat, cocok untuk video 30 detik.",
  mitos: "Bongkar kesalahpahaman, bagus untuk memancing komentar.",
  cerita: "Cerita pribadi, membangun kedekatan dengan penonton.",
  tutorial: "Panduan langkah demi langkah yang mudah ditiru.",
  beforeafter: "Perbandingan visual yang kuat, retensi tinggi.",
  opini: "Sudut pandang berani untuk memancing diskusi.",
};

export function generateIdeas(niche: string, count: number): Idea[] {
  const n = niche.trim();
  return shuffle(IDEA_PATTERNS)
    .slice(0, count)
    .map((p) => ({ title: p.t.replaceAll("{n}", n), formula: p.f, angle: ANGLE[p.f] }));
}

const TITLE_PATTERNS = [
  "{t}: Ini yang Harus Kamu Tahu!",
  "Jangan Salah! Begini Cara {t}",
  "{t} dalam 30 Detik",
  "Rahasia {t} yang Jarang Diketahui",
  "Kesalahan Fatal Soal {t}",
  "Pemula Wajib Tahu: {t}",
  "Kenapa {t} Penting Banget?",
  "Cara Mudah {t} Tanpa Ribet",
  "{t}, Ternyata Segampang Ini!",
  "Mitos vs Fakta: {t}",
  "Coba Ini Sebelum Kamu {t}",
  "Baru Tahu! {t}",
];

export function generateTitlePack(topic: string, tone: string, niche = ""): TitlePack {
  const t = topic.trim();
  const toneSet = TONE[tone] ?? TONE.santai;
  const allHooks = [
    ...toneSet.hooks,
    ...Object.values(FORMULA).flatMap((f) => f.hooks),
  ];
  return {
    titles: shuffle(TITLE_PATTERNS).slice(0, 10).map((p) => fill(p, t)),
    hooks: shuffle(allHooks).slice(0, 6).map((h) => fill(h, t)),
    hashtags: makeHashtags(t, niche),
    caption: makeCaption(t),
  };
}
