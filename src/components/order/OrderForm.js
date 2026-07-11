"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUploader } from "./PhotoUploader";
import { useOrderStore } from "@/stores/orderStore";
import {
  orderServiceStepSchema,
  orderPhotoStepSchema,
  orderPickupStepSchema,
} from "@/lib/validations";
import { calculatePrice, cn, formatRupiah, toUnixSeconds } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Layanan" },
  { n: 2, label: "Foto" },
  { n: 3, label: "Pickup" },
  { n: 4, label: "Konfirmasi" },
];

/**
 * Multi-step order creation form.
 * @param {{services: Array<any>}} props
 */
export function OrderForm({ services = [] }) {
  const router = useRouter();
  const store = useOrderStore();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const service = store.service;
  const total = useMemo(
    () => (service ? calculatePrice(service, store.estimatedWeight) : 0),
    [service, store.estimatedWeight],
  );

  const setErr = (obj) => setErrors(obj || {});

  const validateStep = () => {
    if (store.step === 1) {
      const res = orderServiceStepSchema.safeParse({
        serviceId: service?.id || "",
        estimatedWeight: store.estimatedWeight,
      });
      if (!res.success) {
        setErr(res.error.flatten().fieldErrors);
        return false;
      }
    }
    if (store.step === 2) {
      const res = orderPhotoStepSchema.safeParse({ photos: store.photos });
      if (!res.success) {
        setErr(res.error.flatten().fieldErrors);
        toast.error("Unggah minimal 1 foto");
        return false;
      }
    }
    if (store.step === 3) {
      const res = orderPickupStepSchema.safeParse({
        pickupAddress: store.pickupAddress,
        pickupDatetime: store.pickupDatetime,
        specialNotes: store.specialNotes,
      });
      if (!res.success) {
        setErr(res.error.flatten().fieldErrors);
        return false;
      }
    }
    setErr({});
    return true;
  };

  const next = () => {
    if (validateStep()) store.next();
  };

  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service.id,
          estimated_weight: Number(store.estimatedWeight),
          photos: store.photos.map((p) => ({
            url: p.url,
            delete_url: p.delete_url,
          })),
          special_notes: store.specialNotes || null,
          pickup_address: store.pickupAddress,
          pickup_datetime: toUnixSeconds(store.pickupDatetime),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal membuat pesanan");
      toast.success("Pesanan berhasil dibuat!");
      const id = json.data.id;
      store.reset();
      router.push(`/order/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  store.step > s.n && "bg-emerald-500 text-white",
                  store.step === s.n && "bg-primary text-white",
                  store.step < s.n && "bg-slate-100 text-slate-400",
                )}
              >
                {store.step > s.n ? <Check className="h-4 w-4" /> : s.n}
              </div>
              <span
                className={cn(
                  "text-xs",
                  store.step >= s.n ? "text-slate-700" : "text-slate-400",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  store.step > s.n ? "bg-emerald-500" : "bg-slate-200",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          {/* Step 1 */}
          {store.step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Pilih Layanan</Label>
                <Select
                  value={service?.id || ""}
                  onValueChange={(id) =>
                    store.setService(services.find((s) => s.id === id))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} — {formatRupiah(s.pricePerKg)}/kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceId && (
                  <p className="text-xs text-red-600">{errors.serviceId[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weight">Estimasi Berat (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.5"
                  value={store.estimatedWeight}
                  onChange={(e) => store.setEstimatedWeight(e.target.value)}
                  placeholder="mis. 3"
                />
                {service && (
                  <p className="text-xs text-slate-500">
                    Berat minimum {service.minWeight} kg · estimasi{" "}
                    {service.estimatedHours} jam
                  </p>
                )}
                {errors.estimatedWeight && (
                  <p className="text-xs text-red-600">{errors.estimatedWeight[0]}</p>
                )}
              </div>

              {service && (
                <div className="rounded-xl bg-primary/5 p-4">
                  <p className="text-sm text-slate-500">Estimasi Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatRupiah(total)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {store.step === 2 && (
            <div className="space-y-2">
              <Label>Foto Pakaian</Label>
              <PhotoUploader photos={store.photos} onChange={store.setPhotos} />
              {errors.photos && (
                <p className="text-xs text-red-600">{errors.photos[0]}</p>
              )}
            </div>
          )}

          {/* Step 3 */}
          {store.step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pickup-address">Alamat Pickup</Label>
                <Textarea
                  id="pickup-address"
                  value={store.pickupAddress}
                  onChange={(e) =>
                    store.setPickup({ pickupAddress: e.target.value })
                  }
                  placeholder="Jl. Melati No. 10, Jakarta"
                />
                {errors.pickupAddress && (
                  <p className="text-xs text-red-600">{errors.pickupAddress[0]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pickup-datetime">Jadwal Pickup</Label>
                <Input
                  id="pickup-datetime"
                  type="datetime-local"
                  value={store.pickupDatetime}
                  onChange={(e) =>
                    store.setPickup({ pickupDatetime: e.target.value })
                  }
                />
                {errors.pickupDatetime && (
                  <p className="text-xs text-red-600">{errors.pickupDatetime[0]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  value={store.specialNotes}
                  onChange={(e) =>
                    store.setPickup({ specialNotes: e.target.value })
                  }
                  placeholder="mis. pisahkan pakaian putih"
                />
              </div>
            </div>
          )}

          {/* Step 4 */}
          {store.step === 4 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Review Pesanan</h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <Row label="Layanan" value={service?.name} />
                <Row
                  label="Estimasi Berat"
                  value={`${store.estimatedWeight} kg`}
                />
                <Row label="Jumlah Foto" value={`${store.photos.length} foto`} />
                <Row label="Alamat Pickup" value={store.pickupAddress} />
                <Row
                  label="Jadwal Pickup"
                  value={
                    store.pickupDatetime
                      ? new Date(store.pickupDatetime).toLocaleString("id-ID")
                      : "-"
                  }
                />
                {store.specialNotes && (
                  <Row label="Catatan" value={store.specialNotes} />
                )}
                <div className="flex items-center justify-between py-3">
                  <dt className="font-medium text-slate-900">Total</dt>
                  <dd className="text-lg font-bold text-primary">
                    {formatRupiah(total)}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={store.prev}
              disabled={store.step === 1 || submitting}
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali
            </Button>
            {store.step < 4 ? (
              <Button type="button" onClick={next}>
                Lanjut
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Konfirmasi Pesanan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value || "-"}</dd>
    </div>
  );
}
