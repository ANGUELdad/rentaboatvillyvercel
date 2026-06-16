import { NotFoundContent } from "@/components/errors/NotFoundContent";
import { SiteErrorChrome } from "@/components/errors/SiteErrorChrome";

export default function NotFound() {
  return (
    <SiteErrorChrome>
      <NotFoundContent />
    </SiteErrorChrome>
  );
}
