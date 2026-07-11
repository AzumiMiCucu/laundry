import { cn, STATUS_LABELS, STATUS_STYLES } from "@/lib/utils";

/**
 * Colored badge for an order status.
 * @param {{status:string, className?:string}} props
 */
export function OrderStatusBadge({ status, className }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
