import Link from "next/link";
import { Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
        <Waves className="h-6 w-6" />
      </span>
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-500">Halaman yang kamu cari tidak ditemukan.</p>
      <Button asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
