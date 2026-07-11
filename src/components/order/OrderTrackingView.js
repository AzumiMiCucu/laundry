"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { formatDate, formatRupiah } from "@/lib/utils";

/**
 * @param {{orderId:string}} props
 */
export function OrderTrackingView({ orderId }) {
  const { order, loading, error, refresh } = useOrderTracking(orderId, {
    pollMs: 30000,
  });
  const [paying, setPaying] = useState(false);

  const pay = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "paid", paymentMethod: "transfer" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Pembayaran gagal");
      toast.success("Pembayaran berhasil");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">{error || "Order tidak ditemukan"}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/orders">Kembali ke Pesanan</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const before = order.photos?.filter((p) => p.photoType === "before") || [];
  const after = order.photos?.filter((p) => p.photoType === "after") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{order.orderNumber}</h1>
          <p className="text-xs text-slate-400">
            Dibuat {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="ml-auto">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline timeline={order.timeline} />
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Foto Pakaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PhotoGrid title="Sebelum" photos={before} />
              {after.length > 0 && <PhotoGrid title="Sesudah" photos={after} />}
              {before.length === 0 && after.length === 0 && (
                <p className="text-sm text-slate-500">Belum ada foto.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail + payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Detail label="Layanan" value={order.service?.name} />
              <Detail label="Berat" value={`${order.weight} kg`} />
              {order.pickupAddress && (
                <Detail
                  label="Alamat Pickup"
                  value={
                    <span className="inline-flex items-start gap-1">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      {order.pickupAddress}
                    </span>
                  }
                />
              )}
              {order.pickupDatetime && (
                <Detail
                  label="Jadwal Pickup"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(order.pickupDatetime)}
                    </span>
                  }
                />
              )}
              {order.specialNotes && (
                <Detail label="Catatan" value={order.specialNotes} />
              )}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {formatRupiah(order.totalPrice)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-slate-500">Pembayaran</span>
                  <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
                    {order.paymentStatus === "paid" ? "Lunas" : "Belum Bayar"}
                  </Badge>
                </div>
              </div>

              {order.paymentStatus === "unpaid" && (
                <Button className="w-full" onClick={pay} disabled={paying}>
                  {paying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  Bayar Sekarang
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value || "-"}</span>
    </div>
  );
}

function PhotoGrid({ title, photos }) {
  if (!photos.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-600">{title}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((p) => (
          <a
            key={p.id}
            href={p.imgbbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square overflow-hidden rounded-xl border border-slate-200"
          >
            <Image
              src={p.imgbbUrl}
              alt={title}
              fill
              sizes="120px"
              className="object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
