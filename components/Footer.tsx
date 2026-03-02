"use client";

import { useI18n } from "@/components/LanguageProvider";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-ink-800 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-ink-500 text-sm space-y-1">
        <p>© {new Date().getFullYear()} {t("footer.copyright")}</p>
        <p>{t("footer.availableWorldwide")}</p>
      </div>
    </footer>
  );
}
