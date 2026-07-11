import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { nowSeconds } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * GET /api/orders/[id] — order detail with service, photos, timeline.
 * Customer can only read own orders.
 */
export async function GET(_request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const { id } = await params;

  const rows = await db
    .select({
      order: schema.orders,
      service: schema.services,
      customer: {
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phone: schema.users.phone,
      },
    })
    .from(schema.orders)
    .leftJoin(schema.services, eq(schema.orders.serviceId, schema.services.id))
    .leftJoin(schema.users, eq(schema.orders.customerId, schema.users.id))
    .where(eq(schema.orders.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }
  if (session.user.role !== "admin" && row.order.customerId !== session.user.id) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const photos = await db
    .select()
    .from(schema.orderPhotos)
    .where(eq(schema.orderPhotos.orderId, id));

  const timeline = await db
    .select()
    .from(schema.orderStatusHistory)
    .where(eq(schema.orderStatusHistory.orderId, id))
    .orderBy(asc(schema.orderStatusHistory.updatedAt));

  return NextResponse.json({
    data: { ...row.order, service: row.service, customer: row.customer, photos, timeline },
  });
}

/**
 * PATCH /api/orders/[id] — payment update (mark paid). Customer or admin.
 */
export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .limit(1);
  const order = rows[0];
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }
  if (session.user.role !== "admin" && order.customerId !== session.user.id) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const updates = { updatedAt: nowSeconds() };
  if (body.paymentStatus === "paid") {
    updates.paymentStatus = "paid";
    updates.paymentMethod = body.paymentMethod || "transfer";
  }

  await db
    .update(schema.orders)
    .set(updates)
    .where(eq(schema.orders.id, id));

  // Award loyalty points on payment (10% of price / 1000).
  if (body.paymentStatus === "paid" && order.paymentStatus !== "paid") {
    const points = Math.max(1, Math.round(order.totalPrice / 1000));
    await db.insert(schema.loyaltyTransactions).values({
      id: crypto.randomUUID(),
      userId: order.customerId,
      orderId: order.id,
      points,
      description: `Poin dari pembayaran ${order.orderNumber}`,
      createdAt: nowSeconds(),
    });
    const userRows = await db
      .select({ loyaltyPoints: schema.users.loyaltyPoints })
      .from(schema.users)
      .where(eq(schema.users.id, order.customerId))
      .limit(1);
    const current = userRows[0]?.loyaltyPoints || 0;
    await db
      .update(schema.users)
      .set({ loyaltyPoints: current + points })
      .where(eq(schema.users.id, order.customerId));
  }

  const updated = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .limit(1);
  return NextResponse.json({ data: updated[0] });
}
