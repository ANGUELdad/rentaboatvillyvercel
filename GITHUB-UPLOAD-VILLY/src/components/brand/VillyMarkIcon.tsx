import { cn } from "@/lib/utils";

interface VillyMarkIconProps {
  className?: string;
  size?: number;
}

/** Square sailboat mark — fits circular avatars and compact brand slots */
export function VillyMarkIcon({ className, size }: VillyMarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={cn("shrink-0", className)}
      style={size != null ? { width: size, height: size } : undefined}
      aria-hidden
    >
      <path
        d="M32 14v22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M20 48a6 6 0 0 1-6-6 1.5 1.5 0 0 1 1.5-1.5h33A1.5 1.5 0 0 1 50 42a6 6 0 0 1-6 6H20z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M24 18.5a1.5 1.5 0 0 1 2.28-.29l18 16.2A1.5 1.5 0 0 1 43 38H21a1.5 1.5 0 0 1-1.24-2.35l4.24-17.15z"
        fill="currentColor"
      />
    </svg>
  );
}
