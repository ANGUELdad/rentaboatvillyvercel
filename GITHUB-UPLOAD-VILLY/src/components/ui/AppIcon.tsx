import { SiteIcon } from "@/components/ui/SiteIcon";
import type { SiteIconName } from "@/lib/site-icons";
import { cn } from "@/lib/utils";

type AppIconVariant = "brand" | "action" | "muted" | "glass";

const variantStyles: Record<AppIconVariant, string> = {
  brand: "icon-badge text-ds-brand",
  action: "border border-ds-action/30 bg-ds-action/15 text-ds-action",
  muted: "bg-ds-surface/50 text-ds-text-secondary border-ds-border",
  glass: "glass-subtle text-ds-brand",
};

interface AppIconProps {
  name: SiteIconName | string;
  variant?: AppIconVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { box: "size-9", icon: 16 },
  md: { box: "size-11", icon: 20 },
  lg: { box: "size-14", icon: 24 },
};

export function AppIcon({
  name,
  variant = "brand",
  size = "md",
  className,
}: AppIconProps) {
  const s = sizes[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl border",
        s.box,
        variantStyles[variant],
        className,
      )}
    >
      <SiteIcon name={name} size={s.icon} />
    </span>
  );
}
