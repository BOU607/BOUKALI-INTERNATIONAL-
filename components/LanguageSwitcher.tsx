"use client";

import { useI18n } from "@/components/LanguageProvider";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-1.5 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        aria-label="Language"
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
