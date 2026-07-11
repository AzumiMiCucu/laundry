"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { formatDate, formatRupiah, STATUS_LABELS } from "@/lib/utils";

/**
 * @param {{orderId:string}} props
 */
export function AdminOrderDetail({ orderId }) {
  const { order, loading, error, refresh } = useOrderTracking(orderId);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const currentStatus = status || order?.status || "pending";

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentStatus, notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal memperbarui status");
      toast.success("Status diperbarui");
      setNotes("");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
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
            <Link href="/admin/orders">Kembali</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const before = order.photos?.filter((p) => p.photoType === "before") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{order.orderNumber}</h1>
          <p className="text-xs text-slate-400">Dibuat {formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Status update */}
          <Card>
            <CardHeader>
              <CardTitle>Perbarui Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Status Baru</Label>
                <Select value={currentStatus} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="mis. sedang dalam proses pencucian"
                />
              </div>
              <Button onClick={save} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Status
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline timeline={order.timeline} />
            </CardContent>
          </Card>

          {/* Customer photos */}
          <Card>
            <CardHeader>
              <CardTitle>Foto Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              {before.length === 0 ? (
                <p className="text-sm text-slate-500">Tidak ada foto.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {before.map((p) => (
                    <a
                      key={p.id}
                      href={p.imgbbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                    >
                      <Image
                        src={p.imgbbUrl}
                        alt="Foto pelanggan"
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar detail */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">{order.customer?.name}</p>
              <p className="inline-flex items-center gap-2 text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {order.customer?.email}
              </p>
              {order.customer?.phone && (
                <p className="inline-flex items-center gap-2 text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {order.customer.phone}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Layanan" value={order.service?.name} />
              <Row label="Berat" value={`${order.weight} kg`} />
              {order.pickupAddress && (
                <Row
                  label="Alamat"
                  value={
                    <span className="inline-flex items-start gap-1">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      {order.pickupAddress}
                    </span>
                  }
                />
              )}
              {order.pickupDatetime && (
                <Row label="Jadwal" value={formatDate(order.pickupDatetime)} />
              )}
              {order.specialNotes && <Row label="Catatan" value={order.specialNotes} />}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value || "-"}</span>
    </div>
  );
}
