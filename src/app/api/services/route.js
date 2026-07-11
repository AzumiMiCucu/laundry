import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { serviceSchema } from "@/lib/validations";

export const runtime = "nodejs";

/**
 * GET /api/services — list services. ?all=1 (admin) returns inactive too.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const wantAll = searchParams.get("all") === "1";

  let rows;
  if (wantAll) {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }
    rows = await db.select().from(schema.services).orderBy(asc(schema.services.name));
  } else {
    rows = await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.isActive, 1))
      .orderBy(asc(schema.services.name));
  }
  return NextResponse.json({ data: rows });
}

/**
 * POST /api/services — create a service (admin).
 */
export async function POST(request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const d = parsed.data;
  const id = randomUUID();
  await db.insert(schema.services).values({
    id,
    name: d.name,
    description: d.description || null,
    pricePerKg: d.pricePerKg,
    minWeight: d.minWeight,
    estimatedHours: d.estimatedHours,
    isActive: d.isActive ?? 1,
  });
  const created = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, id))
    .limit(1);
  return NextResponse.json({ data: created[0] }, { status: 201 });
}

/**
 * PATCH /api/services — update / toggle a service (admin). Body includes id.
 */
export async function PATCH(request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  if (!body?.id) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  const updates = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description || null;
  if (body.pricePerKg !== undefined) updates.pricePerKg = Number(body.pricePerKg);
  if (body.minWeight !== undefined) updates.minWeight = Number(body.minWeight);
  if (body.estimatedHours !== undefined)
    updates.estimatedHours = Number(body.estimatedHours);
  if (body.isActive !== undefined) updates.isActive = Number(body.isActive) ? 1 : 0;

  await db
    .update(schema.services)
    .set(updates)
    .where(eq(schema.services.id, body.id));

  const updated = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, body.id))
    .limit(1);
  return NextResponse.json({ data: updated[0] });
}

/**
 * DELETE /api/services?id=... — remove a service (admin).
 */
export async function DELETE(request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }
  await db.delete(schema.services).where(eq(schema.services.id, id));
  return NextResponse.json({ ok: true });
}
