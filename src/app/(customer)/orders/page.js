import Link from "next/link";
import { eq } from "drizzle-orm";
import { Gift, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderHistoryList } from "@/components/order/OrderHistoryList";

export const dynamic = "force-dynamic";

async function getLoyalty(userId) {
  try {
    const rows = await db
      .select({ points: schema.users.loyaltyPoints })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    return rows[0]?.points || 0;
  } catch {
    return 0;
  }
}

export default async function OrdersPage() {
  const session = await auth();
  const points = session?.user ? await getLoyalty(session.user.id) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pesanan Saya</h1>
          <p className="text-sm text-slate-500">Riwayat dan status laundry-mu.</p>
        </div>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/order/new">
            <Plus className="h-4 w-4" />
            Pesan
          </Link>
        </Button>
      </div>

      {/* Loyalty */}
      <Card className="mb-6 border-accent/20 bg-accent/5">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Poin Loyalitas</p>
            <p className="text-2xl font-bold text-accent">{points} poin</p>
          </div>
        </CardContent>
      </Card>

      <OrderHistoryList />
    </div>
  );
}
