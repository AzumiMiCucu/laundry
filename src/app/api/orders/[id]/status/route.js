import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { updateStatusSchema } from "@/lib/validations";
import { nowSeconds } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * PATCH /api/orders/[id]/status — admin updates order status + history entry.
 */
export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const { status, notes } = parsed.data;

  const rows = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .limit(1);
  const order = rows[0];
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  const now = nowSeconds();
  await db
    .update(schema.orders)
    .set({ status, updatedAt: now })
    .where(eq(schema.orders.id, id));

  await db.insert(schema.orderStatusHistory).values({
    id: randomUUID(),
    orderId: id,
    status,
    notes: notes || null,
    updatedBy: session.user.id,
    updatedAt: now,
  });

  const updated = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .limit(1);
  return NextResponse.json({ data: updated[0] });
}
