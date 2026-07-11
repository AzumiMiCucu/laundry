import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { OrderForm } from "@/components/order/OrderForm";

export const dynamic = "force-dynamic";

async function getServices() {
  try {
    return await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.isActive, 1))
      .orderBy(asc(schema.services.name));
  } catch {
    return [];
  }
}

export default async function NewOrderPage() {
  const services = await getServices();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pesan Laundry Baru</h1>
        <p className="text-sm text-slate-500">
          Lengkapi 4 langkah berikut untuk membuat pesanan.
        </p>
      </div>
      <OrderForm services={services} />
    </div>
  );
}
