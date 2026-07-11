import { Check } from "lucide-react";
import { cn, formatDate, STATUS_LABELS } from "@/lib/utils";

/**
 * Vertical timeline built from order_status_history rows.
 * @param {{timeline: Array<{id:string,status:string,notes:string,updatedAt:number}>}} props
 */
export function OrderTimeline({ timeline = [] }) {
  if (!timeline.length) {
    return (
      <p className="text-sm text-slate-500">Belum ada riwayat status.</p>
    );
  }

  return (
    <ol className="relative space-y-6">
      {timeline.map((entry, i) => {
        const isLast = i === timeline.length - 1;
        return (
          <li key={entry.id} className="relative flex gap-4 pl-2">
            {!isLast && (
              <span
                className="absolute left-[18px] top-8 h-full w-px bg-slate-200"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                isLast ? "bg-primary text-white" : "bg-emerald-500 text-white",
              )}
            >
              <Check className="h-4 w-4" />
            </span>
            <div className="pt-1">
              <p className="text-sm font-semibold text-slate-900">
                {STATUS_LABELS[entry.status] || entry.status}
              </p>
              {entry.notes && (
                <p className="mt-0.5 text-sm text-slate-600">{entry.notes}</p>
              )}
              <p className="mt-0.5 text-xs text-slate-400">
                {formatDate(entry.updatedAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
