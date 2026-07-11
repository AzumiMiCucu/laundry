"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculatePrice, formatRupiah } from "@/lib/utils";

/**
 * Interactive price estimator for the landing page.
 * @param {{services: Array<any>}} props
 */
export function PriceCalculator({ services = [] }) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [weight, setWeight] = useState("3");

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) || services[0],
    [services, serviceId],
  );

  const effectiveWeight = Math.max(Number(weight) || 0, service?.minWeight || 0);
  const total = service ? calculatePrice(service, weight) : 0;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Kalkulator Harga
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="calc-service">Layanan</Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger id="calc-service">
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="calc-weight">Estimasi Berat (kg)</Label>
          <Input
            id="calc-weight"
            type="number"
            min="0"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          {service && effectiveWeight > (Number(weight) || 0) && (
            <p className="text-xs text-amber-600">
              Berat minimum {service.minWeight} kg diterapkan.
            </p>
          )}
        </div>

        <div className="rounded-xl bg-primary/5 p-4">
          <p className="text-sm text-slate-500">Estimasi Total</p>
          <p className="text-3xl font-bold text-primary">{formatRupiah(total)}</p>
          {service && (
            <p className="mt-1 text-xs text-slate-500">
              {effectiveWeight} kg × {formatRupiah(service.pricePerKg)} · estimasi{" "}
              {service.estimatedHours} jam
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
