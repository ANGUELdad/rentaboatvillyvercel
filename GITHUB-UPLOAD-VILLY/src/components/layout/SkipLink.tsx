import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getTranslatedDictionary } from "@/lib/i18n/server";

export async function SkipLink() {
  const locale = await getRequestLocale();
  const dict = await getTranslatedDictionary(locale);
  const label = dict.common?.skipToMain ?? "Skip to main content";

  return (
    <a href="#main-content" className="skip-link">
      {label}
    </a>
  );
}
