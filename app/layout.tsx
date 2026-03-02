import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "BOUKALI INTERNATIONAL — Buy & Sell",
  description: "BOUKALI INTERNATIONAL – your place to buy and sell products online.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale =
    localeCookie && LOCALES.includes(localeCookie as Locale)
      ? (localeCookie as Locale)
      : DEFAULT_LOCALE;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const lang = locale === "ar" ? "ar" : locale === "fr" ? "fr" : locale === "es" ? "es" : "en";

  return (
    <html lang={lang} dir={dir} className={`${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <LanguageProvider initialLocale={locale}>
            <CartProvider>
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
