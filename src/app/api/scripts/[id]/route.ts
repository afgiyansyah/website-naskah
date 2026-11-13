import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { scripts } from "@/db/schema";
import { pickScriptFields } from "@/lib/script-input";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function getId(ctx: Ctx) {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) ? n : null;
}

export async function GET(_req: Request, ctx: Ctx) {
  const id = await getId(ctx);
  if (id === null) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const [row] = await db.select().from(scripts).where(eq(scripts.id, id));
  if (!row) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const id = await getId(ctx);
  if (id === null) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const fields = pickScriptFields(await req.json().catch(() => null));
  if (!fields) return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  if (fields.title === "") delete fields.title;
  const [row] = await db
    .update(scripts)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(scripts.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const id = await getId(ctx);
  if (id === null) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  await db.delete(scripts).where(eq(scripts.id, id));
  return NextResponse.json({ ok: true });
}
