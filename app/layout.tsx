import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Nav } from "@/components/Nav";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-ink-800 py-8 mt-auto">
            <div className="container mx-auto px-4 text-center text-ink-500 text-sm">
              © {new Date().getFullYear()} BOUKALI INTERNATIONAL. Buy & sell with confidence.
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
