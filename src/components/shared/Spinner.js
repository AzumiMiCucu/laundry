import { Loader2 } from "lucide-react";

/**
 * Centered spinner used by loading.js segments.
 * @param {{label?:string}} props
 */
export function Spinner({ label = "Memuat…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
