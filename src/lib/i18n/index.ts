import type { ChatTree } from "@/types";
import { getEnglishDictionary } from "./dictionary";
import type { Locale, LocaleStrings } from "./types";

export { getEnglishDictionary } from "./dictionary";
export { isLongLanguage, TEXT_BUDGETS } from "./text-budgets";
export type { Locale, LocaleStrings };
export {
  LOCALES,
  LANG_COOKIE,
  LOCALE_SNAPSHOT_CACHE_VERSION,
} from "./types";

/** @deprecated Use getEnglishDictionary — non-en locales come from auto-translate API. */
export function getDictionary(locale: Locale): LocaleStrings {
  return getEnglishDictionary();
}

export function getChatTreeFromDictionary(dict: LocaleStrings): ChatTree {
  const tree: ChatTree = {};
  for (const [key, value] of Object.entries(dict.chat)) {
    if (key === "title" || key === "subtitle") continue;
    if (typeof value === "object" && value !== null && "message" in value) {
      tree[key] = value as ChatTree[string];
    }
  }
  return tree;
}

export function getChatTreeFromLocale(locale: Locale): ChatTree {
  return getChatTreeFromDictionary(getDictionary(locale));
}
