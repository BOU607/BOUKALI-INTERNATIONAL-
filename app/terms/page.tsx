"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm text-amber-200">
          <strong>Legal notice:</strong> This page is a professional template pending final legal details.
          Please replace placeholder fields (owner name, SIRET, and address) before public legal publication.
        </p>
      </div>
      <h1 className="font-display text-3xl font-bold text-stone-100 mb-6 border-b border-ink-800 pb-3">
        Terms of Service & Legal Mentions
      </h1>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">
          1. Legal Identity (Mentions Legales)
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          This website is operated by <strong>[OWNER_NAME]</strong>, registered in France.
        </p>
        <p className="text-stone-300 text-sm leading-relaxed">
          <strong>SIRET:</strong> [SIRET_NUMBER]
        </p>
        <p className="text-stone-300 text-sm leading-relaxed">
          <strong>Address:</strong> [BUSINESS_ADDRESS], France
        </p>
        <p className="text-stone-300 text-sm leading-relaxed">
          <strong>Hosting:</strong> Vercel (AWS infrastructure)
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">
          2. Our Role: Digital Intermediary
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          We operate a marketplace platform that connects buyers and sellers. We do not own, store, or ship the items.
          The sales contract is between buyer and seller.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">
          3. Payments & Release
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          Payments are processed securely by Stripe. Seller payouts can be released after delivery confirmation through
          platform controls and order workflow.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">
          4. Platform Fees
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          Platform fees may include a buyer service fee and a seller commission. Fee percentages are displayed at
          checkout and in order details.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">
          5. Disputes
        </h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          If an item is not received or significantly differs from description, buyers should contact support promptly.
          We may hold or delay payout release while reviewing dispute evidence.
        </p>
      </section>

      <section className="mb-8 border-t border-ink-800 pt-4">
        <p className="text-ink-500 text-sm">
          Governed by the laws of <strong>France</strong>. By using this site, you agree to these terms.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/contact" className="btn-secondary">
          Contact support
        </Link>
        <Link href="/" className="btn-ghost text-sm">
          Back to home
        </Link>
      </div>
    </div>
  );
}

