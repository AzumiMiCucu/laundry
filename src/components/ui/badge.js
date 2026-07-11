import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary ring-primary/20",
        secondary: "bg-slate-100 text-slate-700 ring-slate-500/20",
        outline: "text-slate-700 ring-slate-300",
        success: "bg-emerald-100 text-emerald-700 ring-emerald-500/20",
        warning: "bg-amber-100 text-amber-700 ring-amber-500/20",
        destructive: "bg-red-100 text-red-700 ring-red-500/20",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
