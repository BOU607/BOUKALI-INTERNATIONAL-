"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm text-amber-200">
          <strong>Legal notice:</strong> This page is a professional template pending final legal review.
          Please replace placeholder fields before publication.
        </p>
      </div>

      <h1 className="font-display text-3xl font-bold text-stone-100 mb-6 border-b border-ink-800 pb-3">
        Privacy Policy (GDPR)
      </h1>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">1. Data Controller</h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          This website is managed by <strong>[OWNER_NAME]</strong>, based in France.
        </p>
        <p className="text-stone-300 text-sm leading-relaxed">
          Contact for privacy requests: <strong>[CONTACT_EMAIL]</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">2. Data We Collect</h2>
        <ul className="list-disc ml-6 space-y-2 text-stone-300 text-sm">
          <li>
            <strong>Identity data:</strong> name, email, account details.
          </li>
          <li>
            <strong>Order data:</strong> shipping address, purchased items, order status.
          </li>
          <li>
            <strong>Payment data:</strong> processed by Stripe (we do not store full card data).
          </li>
          <li>
            <strong>Technical/security data:</strong> IP-based location, timestamps, and basic request metadata for fraud
            prevention and platform safety.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">3. Why We Process Data</h2>
        <ul className="list-disc ml-6 space-y-2 text-stone-300 text-sm">
          <li>To provide marketplace services and fulfill orders.</li>
          <li>To process payments and payouts.</li>
          <li>To prevent fraud, abuse, and unauthorized access.</li>
          <li>To comply with legal and tax obligations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">4. Legal Bases (GDPR)</h2>
        <ul className="list-disc ml-6 space-y-2 text-stone-300 text-sm">
          <li>Contract performance (order and account operations).</li>
          <li>Legal obligation (accounting/compliance).</li>
          <li>Legitimate interest (security, abuse prevention, service reliability).</li>
          <li>Consent where required by law.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">5. Data Processors</h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          We use third-party processors including Stripe (payments), Vercel (hosting), and Redis database providers.
          These providers process data under their own compliant terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">6. Data Retention</h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          We keep data only as long as necessary for service delivery, legal obligations, and dispute resolution.
          Retention periods should be finalized in your internal policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-stone-200 mb-3">7. Your Rights</h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          Under GDPR, you may request access, correction, deletion, restriction, portability, or objection to processing.
          You may also lodge a complaint with the CNIL in France.
        </p>
      </section>

      <section className="mb-8 border-t border-ink-800 pt-4">
        <p className="text-ink-500 text-sm">
          Last updated: March 2026. Governed by the laws of France.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/contact" className="btn-secondary">
          Contact support
        </Link>
        <Link href="/terms" className="btn-secondary">
          Terms of service
        </Link>
        <Link href="/" className="btn-ghost text-sm">
          Back to home
        </Link>
      </div>
    </div>
  );
}

