import type { LocaleStrings } from "./types";

export type PublicLocaleStrings = Omit<LocaleStrings, "errors"> & {
  errors: Omit<LocaleStrings["errors"], "admin">;
};

/** Remove admin-only copy from locale payloads sent to public clients. */
export function stripAdminDictionaryKeys(
  dictionary: LocaleStrings,
): PublicLocaleStrings {
  const { admin: _admin, ...errorsRest } = dictionary.errors;
  return {
    ...dictionary,
    errors: errorsRest,
  };
}
