import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import {
  ArrowRight,
  Sparkles,
  Truck,
  Timer,
  ShieldCheck,
  ShoppingBag,
  PackageCheck,
} from "lucide-react";
import { db, schema } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PriceCalculator } from "@/components/shared/PriceCalculator";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getServices() {
  try {
    return await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.isActive, 1))
      .orderBy(asc(schema.services.pricePerKg));
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const services = await getServices();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
              <Sparkles className="h-4 w-4" />
              Antar-jemput gratis
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Laundry Bersih,
              <br />
              <span className="text-primary">Hidup Lebih Ringan</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-slate-600">
              Pesan laundry kapan saja, lacak status real-time, dan bayar dengan
              mudah. Cukup foto pakaianmu, sisanya kami yang urus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/order/new">
                  Pesan Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#layanan">Lihat Layanan</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { icon: Truck, label: "Antar-jemput" },
                { icon: Timer, label: "Express 6 jam" },
                { icon: ShieldCheck, label: "Garansi bersih" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-1 text-center">
                  <f.icon className="h-6 w-6 text-primary" />
                  <span className="text-xs text-slate-600">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:justify-self-end">
            {services.length > 0 ? (
              <PriceCalculator services={services} />
            ) : (
              <Card className="mx-auto w-full max-w-md">
                <CardContent className="p-8 text-center text-sm text-slate-500">
                  Layanan belum tersedia. Jalankan{" "}
                  <code className="rounded bg-slate-100 px-1">bun scripts/seed.js</code>.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="layanan" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Layanan Kami</h2>
          <p className="mt-2 text-slate-600">Pilih layanan sesuai kebutuhanmu.</p>
        </div>

        {services.length === 0 ? (
          <p className="text-center text-sm text-slate-500">Belum ada layanan.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Card key={s.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{s.name}</h3>
                  <p className="mt-1 min-h-[2.5rem] text-sm text-slate-500">
                    {s.description}
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {formatRupiah(s.pricePerKg)}
                      </p>
                      <p className="text-xs text-slate-400">/kg · min {s.minWeight} kg</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      ± {s.estimatedHours} jam
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Cara Pesan</h2>
            <p className="mt-2 text-slate-600">Hanya 3 langkah mudah.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShoppingBag,
                title: "1. Pilih Layanan",
                desc: "Tentukan layanan & estimasi berat, lalu unggah foto pakaian.",
              },
              {
                icon: Truck,
                title: "2. Jadwalkan Pickup",
                desc: "Masukkan alamat dan waktu penjemputan yang kamu inginkan.",
              },
              {
                icon: PackageCheck,
                title: "3. Terima Bersih",
                desc: "Lacak status real-time, dan pakaian bersih diantar kembali.",
              },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg">
              <Link href="/order/new">
                Pesan Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
