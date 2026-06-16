import { BrandSplash } from "@/components/layout/BrandSplash";

/** Visible fallback while async route segments resolve — avoids a blank main area if dev cache stalls hydration. */
export default function SiteLoading() {
  return (
    <div className="site-route-loading" role="status" aria-live="polite" aria-busy="true" aria-label="Loading page">
      <div className="site-route-loading__shell glass-panel">
        <BrandSplash size="md" />
        <div className="site-route-loading__copy">
          <div className="site-route-loading__bar site-route-loading__bar--title" />
          <div className="site-route-loading__bar site-route-loading__bar--line" />
          <div className="site-route-loading__bar site-route-loading__bar--line short" />
        </div>
        <div className="site-route-loading__grid" aria-hidden="true">
          <div className="site-route-loading__card">
            <div className="site-route-loading__thumb" />
            <div className="site-route-loading__meta">
              <div className="site-route-loading__bar site-route-loading__bar--chip" />
              <div className="site-route-loading__bar site-route-loading__bar--line short" />
            </div>
          </div>
          <div className="site-route-loading__card">
            <div className="site-route-loading__thumb" />
            <div className="site-route-loading__meta">
              <div className="site-route-loading__bar site-route-loading__bar--chip" />
              <div className="site-route-loading__bar site-route-loading__bar--line short" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
