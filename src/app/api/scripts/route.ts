import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { scripts } from "@/db/schema";
import { pickScriptFields } from "@/lib/script-input";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(scripts).orderBy(desc(scripts.updatedAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const fields = pickScriptFields(body);
  if (!fields || !fields.title) {
    return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 });
  }
  const [row] = await db
    .insert(scripts)
    .values({ ...fields, title: fields.title })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
