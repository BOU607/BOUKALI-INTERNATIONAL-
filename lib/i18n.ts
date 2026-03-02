export const LOCALES = ["en", "ar", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  es: "Español",
};

/** RTL for Arabic */
export function isRtl(locale: Locale): boolean {
  return locale === "ar";
}
