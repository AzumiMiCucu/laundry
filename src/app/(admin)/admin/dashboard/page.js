import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { ShoppingBag, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { db, schema } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

function startOfDay(daysAgo = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return Math.floor(d.getTime() / 1000);
}

async function getStats() {
  const todayStart = startOfDay(0);
  const tomorrowStart = startOfDay(-1);
  const count = (where) =>
    db
      .select({ v: sql`count(*)`.mapWith(Number) })
      .from(schema.orders)
      .where(where)
      .then((r) => r[0]?.v || 0);
  const sum = (where) =>
    db
      .select({ v: sql`coalesce(sum(${schema.orders.totalPrice}),0)`.mapWith(Number) })
      .from(schema.orders)
      .where(where)
      .then((r) => r[0]?.v || 0);

  const todayOrders = await count(
    and(
      gte(schema.orders.createdAt, todayStart),
      lt(schema.orders.createdAt, tomorrowStart),
    ),
  );
  const todayRevenue = await sum(
    and(
      gte(schema.orders.createdAt, todayStart),
      lt(schema.orders.createdAt, tomorrowStart),
      eq(schema.orders.paymentStatus, "paid"),
    ),
  );
  const pendingOrders = await count(eq(schema.orders.status, "pending"));
  const completedOrders = await count(eq(schema.orders.status, "delivered"));

  const revenueChart = [];
  for (let i = 6; i >= 0; i--) {
    const start = startOfDay(i);
    const end = startOfDay(i - 1);
    const revenue = await sum(
      and(
        gte(schema.orders.createdAt, start),
        lt(schema.orders.createdAt, end),
        eq(schema.orders.paymentStatus, "paid"),
      ),
    );
    revenueChart.push({
      date: new Date(start * 1000).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      }),
      revenue,
    });
  }

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

  return { todayOrders, todayRevenue, pendingOrders, completedOrders, revenueChart, recentOrders };
}

export default async function DashboardPage() {
  let stats;
  try {
    stats = await getStats();
  } catch {
    stats = {
      todayOrders: 0,
      todayRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      revenueChart: [],
      recentOrders: [],
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Ringkasan operasional hari ini.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Order Hari Ini" value={stats.todayOrders} icon={ShoppingBag} accent="primary" />
        <StatsCard
          title="Pendapatan Hari Ini"
          value={formatRupiah(stats.todayRevenue)}
          icon={DollarSign}
          accent="accent"
        />
        <StatsCard title="Menunggu" value={stats.pendingOrders} icon={Clock} accent="warning" />
        <StatsCard
          title="Selesai"
          value={stats.completedOrders}
          icon={CheckCircle2}
          accent="secondary"
        />
      </div>

      <RevenueChart data={stats.revenueChart} />
      <RecentOrders orders={stats.recentOrders} />
    </div>
  );
}
