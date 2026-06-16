import { iconForKey, SITE_ICON_SRC, type SiteIconName } from "@/lib/site-icons";
import { cn } from "@/lib/utils";

interface SiteIconProps {
  name: SiteIconName | string;
  size?: number;
  className?: string;
  label?: string;
}

export function SiteIcon({
  name,
  size = 20,
  className,
  label,
}: SiteIconProps) {
  const resolved: SiteIconName =
    name in SITE_ICON_SRC ? (name as SiteIconName) : iconForKey(name);
  const src = SITE_ICON_SRC[resolved];

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label}
      className={cn("icon-mask inline-flex shrink-0 items-center justify-center text-current", className)}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}
