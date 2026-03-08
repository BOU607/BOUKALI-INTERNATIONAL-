"use client";

import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";

export default function ContactPage() {
  const { t } = useI18n();
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@miahamarket.com";

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <h1 className="font-display text-3xl font-bold text-stone-100 mb-2">
        {t("contact.title")}
      </h1>
      <p className="text-ink-500 mb-8">
        {t("contact.subtitle")}
      </p>

      <div className="card p-6 space-y-6">
        <p className="text-stone-300 text-sm">
          {t("contact.emailLabel")}
        </p>
        <a
          href={`mailto:${contactEmail}`}
          className="text-brand-400 font-medium hover:underline break-all"
        >
          {contactEmail}
        </a>
        <p className="text-ink-500 text-sm">
          {t("contact.note")}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/trust" className="btn-secondary">
          {t("nav.trust")}
        </Link>
        <Link href="/" className="btn-ghost text-sm">
          ← {t("nav.home")}
        </Link>
      </div>
    </div>
  );
}
