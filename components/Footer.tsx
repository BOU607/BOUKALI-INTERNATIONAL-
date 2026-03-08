"use client";

import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-ink-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <Link href="/trust" className="text-ink-400 hover:text-stone-200 text-sm font-medium">
            {t("footer.trust")}
          </Link>
          <Link href="/sell" className="text-ink-400 hover:text-stone-200 text-sm font-medium">
            {t("footer.sell")}
          </Link>
          <Link href="/contact" className="text-ink-400 hover:text-stone-200 text-sm font-medium">
            {t("footer.contact")}
          </Link>
        </div>
        <div className="text-center text-ink-500 text-sm space-y-1">
          <p>© {new Date().getFullYear()} {t("footer.copyright")}</p>
          <p>{t("footer.availableWorldwide")}</p>
        </div>
      </div>
    </footer>
  );
}
