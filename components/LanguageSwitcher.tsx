"use client";

import { useI18n } from "@/components/LanguageProvider";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-ink-400 hidden sm:inline">
        {t("nav.language")}:
      </span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="bg-ink-800 border-2 border-ink-600 rounded-lg px-4 py-2 text-sm font-medium text-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer hover:border-ink-500 min-w-[7rem]"
        aria-label={t("nav.language")}
        title={t("nav.language")}
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_NAMES[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
