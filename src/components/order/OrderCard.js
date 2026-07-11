import Link from "next/link";
import { ArrowRight, Package, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatDate, formatRupiah } from "@/lib/utils";

/**
 * Summary card for one order in a list.
 * @param {{order: any, href?: string}} props
 */
export function OrderCard({ order, href }) {
  const link = href || `/order/${order.id}`;
  return (
    <Link href={link} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold text-slate-900">
                {order.orderNumber}
              </p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {order.serviceName || order.service?.name || "Layanan"} ·{" "}
              {order.weight ? `${order.weight} kg` : "-"}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(order.createdAt, false)}
              </span>
              <span className="font-medium text-slate-700">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
        </CardContent>
      </Card>
    </Link>
  );
}
