"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { formatDate, formatRupiah, STATUS_LABELS } from "@/lib/utils";

export function AdminOrdersTable() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const qs = new URLSearchParams();
    if (status !== "all") qs.set("status", status);
    if (debounced) qs.set("search", debounced);
    qs.set("limit", "50");
    fetch(`/api/orders?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setOrders(json.data || []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, debounced]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nomor order…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Tidak ada order ditemukan.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Order</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{o.orderNumber}</div>
                      <div className="text-xs text-slate-400">
                        {formatDate(o.createdAt, false)}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{o.customerName}</TableCell>
                    <TableCell className="text-slate-700">{o.serviceName}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRupiah(o.totalPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/orders/${o.id}`}>
                          <Eye className="h-4 w-4" />
                          Detail
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
