"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/order/OrderCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, STATUS_LABELS } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "Semua" },
  ...Object.entries(STATUS_LABELS).map(([key, label]) => ({ key, label })),
];

export function OrderHistoryList() {
  const [status, setStatus] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const qs = status === "all" ? "" : `?status=${status}`;
    fetch(`/api/orders${qs}`, { cache: "no-store" })
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
  }, [status]);

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={cn(
              "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              status === f.key
                ? "bg-primary text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <PackageOpen className="h-12 w-12 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">Belum ada pesanan</p>
          <p className="text-sm text-slate-500">
            Yuk buat pesanan laundry pertamamu.
          </p>
          <Button asChild className="mt-4">
            <Link href="/order/new">
              <Plus className="h-4 w-4" />
              Pesan Sekarang
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
