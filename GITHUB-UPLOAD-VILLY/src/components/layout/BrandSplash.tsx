import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

interface BrandSplashProps {
  className?: string;
  size?: "md" | "lg" | "xl";
  animate?: boolean;
}

export function BrandSplash({
  className,
  size = "lg",
  animate = true,
}: BrandSplashProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        animate && "brand-splash-pulse",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Logo linked={false} size={size} />
      <span className="sr-only">Loading</span>
    </div>
  );
}
