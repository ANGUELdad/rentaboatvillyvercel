/** Defensive helpers — prevent NaN, empty-array, and null crashes. */

export function safeMin(values: number[], fallback = 15): number {
  const valid = values.filter((v) => Number.isFinite(v) && v > 0);
  if (valid.length === 0) return fallback;
  return Math.min(...valid);
}

export function safeMax(values: number[], fallback = 0): number {
  const valid = values.filter((v) => Number.isFinite(v));
  if (valid.length === 0) return fallback;
  return Math.max(...valid);
}

export function safeAvgRating(
  items: { rating: number }[],
): string | null {
  if (items.length === 0) return null;
  const sum = items.reduce(
    (acc, item) =>
      acc + (Number.isFinite(item.rating) ? Math.min(5, Math.max(0, item.rating)) : 0),
    0,
  );
  if (sum <= 0) return null;
  return (sum / items.length).toFixed(1);
}

export function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function nonEmpty<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

export function safePrice(value: number, currency = "€"): string {
  if (!Number.isFinite(value) || value < 0) return `${currency}—`;
  return `${currency}${value}`;
}

export function safeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
