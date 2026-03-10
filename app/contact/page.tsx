"use client";

import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import { contact, whatsappHref } from "@/lib/contact";

export default function ContactPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-stone-100 mb-2">
        {t("contact.title")}
      </h1>
      <p className="text-ink-500 mb-8">
        {t("contact.subtitle")}
      </p>

      <div className="card p-6 space-y-5">
        <div>
          <p className="text-ink-500 text-sm mb-1">{t("contact.emailLabel")}</p>
          <a
            href={`mailto:${contact.email}`}
            className="text-brand-400 font-medium hover:underline break-all"
          >
            {contact.email}
          </a>
        </div>

        {contact.phone && (
          <div>
            <p className="text-ink-500 text-sm mb-1">{t("contact.phoneLabel")}</p>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-stone-200 hover:text-brand-400 transition-colors">
              {contact.phone}
            </a>
          </div>
        )}

        {contact.whatsapp && (
          <div>
            <p className="text-ink-500 text-sm mb-1">{t("contact.whatsappLabel")}</p>
            <a
              href={whatsappHref(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-200 hover:text-brand-400 transition-colors inline-flex items-center gap-2"
            >
              {contact.whatsapp}
              <span className="text-xs text-ink-500">(opens WhatsApp)</span>
            </a>
          </div>
        )}

        {contact.address && (
          <div>
            <p className="text-ink-500 text-sm mb-1">{t("contact.addressLabel")}</p>
            <p className="text-stone-200">{contact.address}</p>
          </div>
        )}

        {contact.googleMapLink && (
          <div>
            <a
              href={contact.googleMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 font-medium hover:underline"
            >
              {t("contact.viewOnMap")} →
            </a>
          </div>
        )}

        <p className="text-ink-500 text-sm pt-2 border-t border-ink-800">
          {t("contact.note")}
        </p>
      </div>

      {contact.googleMapEmbedSrc && (
        <div id="map" className="mt-8 rounded-xl overflow-hidden border border-ink-800">
          <div className="aspect-video w-full">
            <iframe
              src={contact.googleMapEmbedSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location map"
              className="block"
            />
          </div>
        </div>
      )}

      {!contact.googleMapEmbedSrc && contact.googleMapLink && (
        <div id="map" className="mt-8">
          <a
            href={contact.googleMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-block"
          >
            {t("contact.viewOnMap")}
          </a>
        </div>
      )}

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
