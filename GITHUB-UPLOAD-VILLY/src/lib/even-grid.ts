/** Trim a list so the last row of a fixed-column grid is always full. */
export function trimToEvenGrid<T>(items: T[], columns: number): T[] {
  if (columns < 1) return items;
  const remainder = items.length % columns;
  if (remainder === 0) return items;
  return items.slice(0, items.length - remainder);
}
