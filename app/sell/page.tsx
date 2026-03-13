"use client";

import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";

export default function SellPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-stone-100 mb-2">
        {t("sell.title")}
      </h1>
      <p className="text-ink-500 mb-8">
        {t("sell.subtitle")}
      </p>

      <ul className="space-y-4 mb-10 text-stone-300 text-sm">
        <li className="flex gap-3">
          <span className="text-brand-400 font-bold">1.</span>
          <span>{t("sell.step1")}</span>
        </li>
        <li className="flex gap-3">
          <span className="text-brand-400 font-bold">2.</span>
          <span>{t("sell.step2")}</span>
        </li>
        <li className="flex gap-3">
          <span className="text-brand-400 font-bold">3.</span>
          <span>{t("sell.step3")}</span>
        </li>
      </ul>

      <p className="text-stone-400 text-sm mb-8">
        {t("sell.trustNote")}
      </p>

      <div className="flex flex-wrap gap-4">
        <Link href="/seller/register" className="btn-primary">
          Become a seller
        </Link>
        <Link href="/seller/login" className="btn-secondary">
          Seller login
        </Link>
        <Link href="/contact" className="btn-ghost">
          {t("sell.contactToSell")}
        </Link>
        <Link href="/trust" className="btn-secondary">
          {t("nav.trust")}
        </Link>
      </div>
    </div>
  );
}
