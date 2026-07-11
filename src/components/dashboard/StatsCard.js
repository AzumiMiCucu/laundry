import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Dashboard metric card.
 * @param {{title:string, value:string|number, icon:React.ComponentType, accent?:string}} props
 */
export function StatsCard({ title, value, icon: Icon, accent = "primary" }) {
  const accents = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            accents[accent] || accents.primary,
          )}
        >
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
