import { createHash } from "crypto";

export function hashString(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex").slice(0, 16);
}

export function cacheKey(
  sourceText: string,
  locale: string,
  slot: string,
): string {
  return hashString(`${sourceText}|${locale}|${slot}`);
}
