export const i18n = {
  defaultLocale: "pl",
  locales: ["pl", "en"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

/** Returns true if the given locale is the default (root) locale. */
export function isDefaultLocale(locale: string): boolean {
  return locale === i18n.defaultLocale;
}

/**
 * Returns the URL path prefix for a locale.
 * Default locale (pl) returns "" (served at root).
 * Non-default locales return "/{locale}" (e.g. "/en").
 */
export function getLocalePath(locale: string): string {
  return locale === i18n.defaultLocale ? "" : `/${locale}`;
}
