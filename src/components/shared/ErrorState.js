"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared error UI used by every route segment's error.js.
 * @param {{error: Error, reset: () => void, title?: string}} props
 */
export function ErrorState({ error, reset, title = "Terjadi Kesalahan" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="max-w-sm text-sm text-slate-500">
        {error?.message || "Sesuatu tidak berjalan sebagaimana mestinya."}
      </p>
      <Button onClick={() => reset()} variant="outline" className="mt-2">
        Coba Lagi
      </Button>
    </div>
  );
}
