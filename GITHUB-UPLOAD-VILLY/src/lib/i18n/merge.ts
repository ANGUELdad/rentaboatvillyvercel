/* eslint-disable @typescript-eslint/no-explicit-any */
export function deepMerge<T extends Record<string, any>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const b = base[key];
    const o = override[key];
    if (
      o &&
      typeof o === "object" &&
      !Array.isArray(o) &&
      b &&
      typeof b === "object" &&
      !Array.isArray(b)
    ) {
      result[key] = deepMerge(b as Record<string, any>, o as Record<string, any>) as T[keyof T];
    } else if (o !== undefined) {
      result[key] = o as T[keyof T];
    }
  }
  return result;
}
