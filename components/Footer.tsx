"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/LanguageProvider";
import { contact, whatsappHref } from "@/lib/contact";

export function Footer() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const hasReach = contact.phone || contact.whatsapp || contact.address || contact.googleMapLink;
  const isSeller = (session?.user as { role?: string } | undefined)?.role === "seller";

  return (
    <footer className="border-t border-ink-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h3 className="font-semibold text-stone-200 mb-3">{t("footer.getHelp")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/trust" className="text-ink-400 hover:text-brand-400 text-sm transition-colors">
                  {t("footer.trust")}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-ink-400 hover:text-brand-400 text-sm transition-colors">
                  {t("footer.trackOrder")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-ink-400 hover:text-brand-400 text-sm transition-colors">
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-stone-200 mb-3">{t("footer.company")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-ink-400 hover:text-brand-400 text-sm transition-colors">
                  {t("footer.home")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-ink-400 hover:text-brand-400 text-sm transition-colors">
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link
                  href={isSeller ? "/seller/dashboard" : "/sell"}
                  className="text-ink-400 hover:text-brand-400 text-sm transition-colors"
                >
                  {isSeller ? "Seller dashboard" : t("footer.sell")}
                </Link>
              </li>
            </ul>
          </div>
          {hasReach && (
            <div>
              <h3 className="font-semibold text-stone-200 mb-3">{t("footer.reachUs")}</h3>
              <ul className="space-y-2 text-sm">
                {contact.phone && (
                  <li>
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-ink-400 hover:text-brand-400 transition-colors">
                      {t("footer.phone")}: {contact.phone}
                    </a>
                  </li>
                )}
                {contact.whatsapp && (
                  <li>
                    <a href={whatsappHref(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-ink-400 hover:text-brand-400 transition-colors">
                      {t("footer.whatsapp")}
                    </a>
                  </li>
                )}
                {(contact.address || contact.googleMapLink) && (
                  <li>
                    <Link href="/contact#map" className="text-ink-400 hover:text-brand-400 transition-colors">
                      {t("footer.findUs")}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <p className="text-ink-500 text-sm mt-8 pt-6 border-t border-ink-800">
          {t("footer.securePayment")}
        </p>
        <div className="text-center text-ink-500 text-sm space-y-1 mt-6">
          <p>© {new Date().getFullYear()} {t("footer.copyright")}</p>
          <p>{t("footer.availableWorldwide")}</p>
        </div>
      </div>
    </footer>
  );
}
