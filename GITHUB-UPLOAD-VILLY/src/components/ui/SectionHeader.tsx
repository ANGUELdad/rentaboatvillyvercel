import { SiteIcon } from "@/components/ui/SiteIcon";
import type { SiteIconName } from "@/lib/site-icons";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  icon?: SiteIconName | string | boolean;
  titleId?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  icon = false,
  titleId,
}: SectionHeaderProps) {
  const showIcon = icon === true ? "explore" : icon || undefined;

  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "section-eyebrow mb-2",
            align === "center" && "justify-center",
            showIcon && "inline-flex items-center gap-2",
          )}
        >
          {showIcon && (
            <span className="icon-badge flex size-7 items-center justify-center rounded-lg">
              <SiteIcon name={showIcon} size={14} />
            </span>
          )}
          {eyebrow}
        </p>
      )}
      <h2 id={titleId} className="section-title">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "section-subtitle mt-3 max-w-2xl",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
