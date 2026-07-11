import { NextResponse } from "next/server";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

/** Start of local day (unix seconds) offset by `daysAgo`. */
function startOfDay(daysAgo = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return Math.floor(d.getTime() / 1000);
}

/**
 * GET /api/dashboard/stats — admin dashboard metrics.
 */
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const todayStart = startOfDay(0);
  const tomorrowStart = startOfDay(-1);

  // Today's orders count.
  const todayOrdersRows = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(schema.orders)
    .where(
      and(
        gte(schema.orders.createdAt, todayStart),
        lt(schema.orders.createdAt, tomorrowStart),
      ),
    );
  const todayOrders = todayOrdersRows[0]?.count || 0;

  // Today's revenue (paid orders).
  const todayRevenueRows = await db
    .select({ total: sql`coalesce(sum(${schema.orders.totalPrice}), 0)`.mapWith(Number) })
    .from(schema.orders)
    .where(
      and(
        gte(schema.orders.createdAt, todayStart),
        lt(schema.orders.createdAt, tomorrowStart),
        eq(schema.orders.paymentStatus, "paid"),
      ),
    );
  const todayRevenue = todayRevenueRows[0]?.total || 0;

  // Pending orders (not yet delivered).
  const pendingRows = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(schema.orders)
    .where(eq(schema.orders.status, "pending"));
  const pendingOrders = pendingRows[0]?.count || 0;

  // Completed (delivered) orders.
  const completedRows = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(schema.orders)
    .where(eq(schema.orders.status, "delivered"));
  const completedOrders = completedRows[0]?.count || 0;

  // Revenue for the last 7 days.
  const revenueChart = [];
  for (let i = 6; i >= 0; i--) {
    const start = startOfDay(i);
    const end = startOfDay(i - 1);
    const rows = await db
      .select({ total: sql`coalesce(sum(${schema.orders.totalPrice}), 0)`.mapWith(Number) })
      .from(schema.orders)
      .where(
        and(
          gte(schema.orders.createdAt, start),
          lt(schema.orders.createdAt, end),
          eq(schema.orders.paymentStatus, "paid"),
        ),
      );
    const label = new Date(start * 1000).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
    revenueChart.push({ date: label, revenue: rows[0]?.total || 0 });
  }

  // 5 most-recent orders.
  const recentOrders = await db
    .select({
      id: schema.orders.id,
      orderNumber: schema.orders.orderNumber,
      totalPrice: schema.orders.totalPrice,
      status: schema.orders.status,
      createdAt: schema.orders.createdAt,
      customerName: schema.users.name,
      serviceName: schema.services.name,
    })
    .from(schema.orders)
    .leftJoin(schema.users, eq(schema.orders.customerId, schema.users.id))
    .leftJoin(schema.services, eq(schema.orders.serviceId, schema.services.id))
    .orderBy(desc(schema.orders.createdAt))
    .limit(5);

  return NextResponse.json({
    todayOrders,
    todayRevenue,
    pendingOrders,
    completedOrders,
    revenueChart,
    recentOrders,
  });
}
