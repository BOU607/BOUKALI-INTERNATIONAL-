"use client";

import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";

export default function TrustPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-stone-100 mb-2">
        {t("trust.title")}
      </h1>
      <p className="text-ink-500 mb-10">
        {t("trust.subtitle")}
      </p>

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-4">
          {t("trust.buySafeTitle")}
        </h2>
        <ul className="space-y-3 text-stone-300 text-sm">
          <li className="flex gap-2"><span className="text-brand-400">✓</span> {t("trust.buy1")}</li>
          <li className="flex gap-2"><span className="text-brand-400">✓</span> {t("trust.buy2")}</li>
          <li className="flex gap-2"><span className="text-brand-400">✓</span> {t("trust.buy3")}</li>
          <li className="flex gap-2"><span className="text-brand-400">✓</span> {t("trust.buy4")}</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-4">
          {t("trust.sellSafeTitle")}
        </h2>
        <ul className="space-y-3 text-stone-300 text-sm">
          <li className="flex gap-2"><span className="text-brand-400">✓</span> {t("trust.sell1")}</li>
          <li className="flex gap-2"><span className="text-brand-400">✓</span> {t("trust.sell2")}</li>
          <li className="flex gap-2"><span className="text-brand-400">✓</span> {t("trust.sell3")}</li>
          <li className="flex gap-2"><span className="text-brand-400">✓</span> {t("trust.sell4")}</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-4">
          {t("trust.commitmentTitle")}
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          {t("trust.commitment")}
        </p>
      </section>

      <div className="flex flex-wrap gap-4">
        <Link href="/contact" className="btn-primary">
          {t("trust.contactUs")}
        </Link>
        <Link href="/" className="btn-secondary">
          {t("nav.home")}
        </Link>
      </div>
    </div>
  );
}
