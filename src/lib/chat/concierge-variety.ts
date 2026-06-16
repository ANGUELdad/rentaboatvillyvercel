/** Pick one item at random — supports a single value or a variant pool. */
export function pick<T>(value: readonly T[]): T;
export function pick<T>(value: T): T;
export function pick<T>(value: T | readonly T[]): T {
  if (Array.isArray(value)) {
    return value[Math.floor(Math.random() * value.length)]!;
  }
  return value as T;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function uniqueStrings(items: string[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

export function diversifySuggestions(
  primary: string[],
  pool: string[],
  limit = 5,
): string[] {
  return uniqueStrings([...shuffle(primary), ...shuffle(pool)], limit);
}

export function thinkingDelayMs(): number {
  return 320 + Math.floor(Math.random() * 680);
}
