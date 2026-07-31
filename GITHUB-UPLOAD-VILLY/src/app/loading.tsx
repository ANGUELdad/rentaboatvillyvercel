import { BrandSplash } from "@/components/layout/BrandSplash";

export default function Loading() {
  return (
    <div
      className="site-route-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="site-route-loading__shell">
        <BrandSplash size="md" />
        <span className="site-route-loading__dot" aria-hidden="true" />
      </div>
    </div>
  );
}
