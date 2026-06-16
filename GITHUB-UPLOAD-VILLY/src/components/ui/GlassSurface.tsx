import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type GlassVariant =
  | "panel"
  | "card"
  | "subtle"
  | "nav"
  | "elevated"
  | "navScrolled"
  | "panel2026"
  | "card2026";

const variants: Record<GlassVariant, string> = {
  panel: "glass-panel",
  card: "glass-card",
  subtle: "glass-subtle",
  nav: "glass-nav",
  elevated: "glass-elevated",
  navScrolled: "glass-nav glass-nav-scrolled",
  panel2026: "glass-panel glass-2026-panel ui-2026-surface",
  card2026: "glass-card glass-2026-card ui-2026-surface",
};

interface GlassSurfaceProps {
  children: ReactNode;
  variant?: GlassVariant;
  className?: string;
  as?: "div" | "section" | "article" | "nav";
}

export function GlassSurface({
  children,
  variant = "card",
  className,
  as: Tag = "div",
}: GlassSurfaceProps) {
  return (
    <Tag className={cn("panel-fit", variants[variant], className)}>{children}</Tag>
  );
}
