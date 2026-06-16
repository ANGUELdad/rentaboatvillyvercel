import en from "../../../data/locales/en.json";
import type { LocaleStrings } from "./types";

const englishDictionary = en as LocaleStrings;

export function getEnglishDictionary(): LocaleStrings {
  return englishDictionary;
}
