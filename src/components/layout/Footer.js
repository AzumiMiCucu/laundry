import Link from "next/link";
import { Waves } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <Waves className="h-5 w-5" />
              </span>
              LaundryKu
            </Link>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Laundry Bersih, Hidup Lebih Ringan. Layanan cuci antar-jemput
              terpercaya di kotamu.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="mb-2 font-semibold text-slate-900">Layanan</p>
              <ul className="space-y-1 text-slate-500">
                <li>Cuci Kering Lipat</li>
                <li>Express</li>
                <li>Setrika</li>
                <li>Dry Clean</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-slate-900">Perusahaan</p>
              <ul className="space-y-1 text-slate-500">
                <li>Tentang</li>
                <li>Kontak</li>
                <li>Kebijakan</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-400">
          © {new Date().getFullYear()} LaundryKu. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
