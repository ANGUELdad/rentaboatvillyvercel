/** Strip HTML and estimate reading time at ~200 wpm. */
export function estimateReadMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

export function formatBlogDate(
  iso: string,
  locale: string,
): string {
  try {
    return new Date(iso).toLocaleDateString(
      locale === "en" ? "en-GB" : locale,
      { day: "numeric", month: "short", year: "numeric" },
    );
  } catch {
    return iso;
  }
}
