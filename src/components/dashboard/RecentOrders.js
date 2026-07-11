import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { formatDate, formatRupiah } from "@/lib/utils";

/**
 * Recent-orders table for the admin dashboard.
 * @param {{orders: Array<any>}} props
 */
export function RecentOrders({ orders = [] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Order Terbaru</CardTitle>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-primary hover:underline"
        >
          Lihat semua
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Belum ada order.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Order</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                    <div className="text-xs text-slate-400">
                      {formatDate(o.createdAt, false)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {o.customerName || "-"}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {o.serviceName || "-"}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatRupiah(o.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
