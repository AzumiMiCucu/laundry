import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations";
import { buildOrderNumber, calculatePrice, dateKey, nowSeconds } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * GET /api/orders
 * Customer: only own orders. Admin: all orders with ?status=&page=&limit=&search=
 */
export async function GET(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const isAdmin = session.user.role === "admin";
  const conditions = [];
  if (!isAdmin) conditions.push(eq(schema.orders.customerId, session.user.id));
  if (status && status !== "all") conditions.push(eq(schema.orders.status, status));
  if (search) conditions.push(like(schema.orders.orderNumber, `%${search}%`));

  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: schema.orders.id,
      orderNumber: schema.orders.orderNumber,
      weight: schema.orders.weight,
      totalPrice: schema.orders.totalPrice,
      status: schema.orders.status,
      paymentStatus: schema.orders.paymentStatus,
      createdAt: schema.orders.createdAt,
      pickupDatetime: schema.orders.pickupDatetime,
      serviceName: schema.services.name,
      customerName: schema.users.name,
      customerEmail: schema.users.email,
    })
    .from(schema.orders)
    .leftJoin(schema.services, eq(schema.orders.serviceId, schema.services.id))
    .leftJoin(schema.users, eq(schema.orders.customerId, schema.users.id))
    .where(where)
    .orderBy(desc(schema.orders.createdAt))
    .limit(limit)
    .offset(offset);

  const countRows = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(schema.orders)
    .where(where);
  const total = countRows[0]?.count || 0;

  return NextResponse.json({
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

/**
 * POST /api/orders — create an order (customer).
 */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // Resolve service + price.
  const serviceRows = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, input.service_id))
    .limit(1);
  const service = serviceRows[0];
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Layanan tidak tersedia" }, { status: 400 });
  }

  const weight = Math.max(input.estimated_weight, service.minWeight);
  const totalPrice = calculatePrice(service, weight);

  // Generate a daily-sequential order number.
  const today = dateKey();
  const prefix = `LDR-${today}-`;
  const countToday = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(schema.orders)
    .where(like(schema.orders.orderNumber, `${prefix}%`));
  const sequence = (countToday[0]?.count || 0) + 1;
  const orderNumber = buildOrderNumber(sequence);

  const now = nowSeconds();
  const orderId = randomUUID();

  await db.insert(schema.orders).values({
    id: orderId,
    orderNumber,
    customerId: session.user.id,
    serviceId: service.id,
    weight,
    totalPrice,
    specialNotes: input.special_notes || null,
    pickupAddress: input.pickup_address || null,
    pickupDatetime: input.pickup_datetime || null,
    deliveryAddress: null,
    deliveryDatetime: null,
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: null,
    createdAt: now,
    updatedAt: now,
  });

  // Photos.
  if (Array.isArray(input.photos) && input.photos.length) {
    await db.insert(schema.orderPhotos).values(
      input.photos.map((p) => ({
        id: randomUUID(),
        orderId,
        imgbbUrl: p.url,
        imgbbDeleteUrl: p.delete_url || null,
        photoType: "before",
        uploadedAt: now,
      })),
    );
  }

  // Initial status history.
  await db.insert(schema.orderStatusHistory).values({
    id: randomUUID(),
    orderId,
    status: "pending",
    notes: "Pesanan dibuat",
    updatedBy: session.user.id,
    updatedAt: now,
  });

  const created = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .limit(1);

  return NextResponse.json({ data: created[0] }, { status: 201 });
}
