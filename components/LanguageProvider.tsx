"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import fr from "@/messages/fr.json";
import es from "@/messages/es.json";

const messages: Record<Locale, Record<string, unknown>> = { en, ar, fr, es };

function getNested(obj: unknown, key: string): string | undefined {
  const value = key.split(".").reduce((o: unknown, k) => (o as Record<string, unknown>)?.[k], obj);
  return typeof value === "string" ? value : undefined;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const COOKIE_NAME = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      document.cookie = `${COOKIE_NAME}=${newLocale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
      setLocaleState(newLocale);
      router.refresh();
    },
    [router]
  );

  const t = useCallback(
    (key: string): string => {
      const loc = LOCALES.includes(locale as Locale) ? locale : DEFAULT_LOCALE;
      return getNested(messages[loc], key) ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
