import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function BoatSpecPill({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-subtle inline-flex max-w-full min-w-0 items-center gap-2.5 rounded-2xl border border-ds-border px-4 py-3 text-sm font-medium text-ds-text-secondary",
        className,
      )}
    >
      <Icon className="size-[18px] shrink-0 text-ds-text-muted" strokeWidth={1.75} />
      <span className="min-w-0 text-balance">{label}</span>
    </div>
  );
}
