const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL || "Miaha Market <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Email platform admin on Stripe dispute events (Resend). No-op if RESEND_API_KEY or ADMIN_EMAIL missing.
 */
export async function notifyAdminStripeDisputeEvent(input: {
  phase: "created" | "closed";
  disputeId: string;
  stripeDisputeStatus?: string;
  paymentIntentId: string | null;
  orderIds: string[];
  /** Stripe dispute amount in smallest currency unit (e.g. cents) */
  amountMinor?: number;
  currency?: string;
  reason?: string | null;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — admin dispute emails disabled");
    return;
  }
  if (!ADMIN_EMAIL) {
    console.warn("ADMIN_EMAIL not set — admin dispute emails disabled");
    return;
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "";
  const adminOrdersLink = base ? `${base}/admin/orders` : "";

  const subject =
    input.phase === "created"
      ? `Stripe dispute opened — ${input.disputeId}`
      : `Stripe dispute closed (${input.stripeDisputeStatus ?? "unknown"}) — ${input.disputeId}`;

  const amountLine =
    input.amountMinor != null && input.currency
      ? `<p><strong>Disputed amount:</strong> ${esc((input.amountMinor / 100).toFixed(2))} ${esc(input.currency.toUpperCase())}</p>`
      : "";

  const ordersHtml =
    input.orderIds.length > 0
      ? `<p><strong>Order IDs:</strong> ${input.orderIds.map((id) => esc(id)).join(", ")}</p>`
      : "<p><strong>Order IDs:</strong> none matched in database</p>";

  const html =
    input.phase === "created"
      ? `
      <h2>Payment dispute opened</h2>
      <p>A buyer opened a card dispute. Payouts for affected orders are blocked until resolved.</p>
      <p><strong>Dispute ID:</strong> ${esc(input.disputeId)}</p>
      <p><strong>PaymentIntent:</strong> ${esc(input.paymentIntentId ?? "—")}</p>
      ${input.reason != null ? `<p><strong>Reason:</strong> ${esc(String(input.reason))}</p>` : ""}
      ${amountLine}
      ${ordersHtml}
      ${adminOrdersLink ? `<p><a href="${esc(adminOrdersLink)}">Open admin orders</a></p>` : ""}
      <p>Contact the buyer and seller; respond in the Stripe Dashboard.</p>
    `
      : `
      <h2>Payment dispute closed</h2>
      <p><strong>Dispute ID:</strong> ${esc(input.disputeId)}</p>
      <p><strong>Stripe outcome:</strong> ${esc(input.stripeDisputeStatus ?? "unknown")}</p>
      <p><strong>PaymentIntent:</strong> ${esc(input.paymentIntentId ?? "—")}</p>
      ${ordersHtml}
      ${adminOrdersLink ? `<p><a href="${esc(adminOrdersLink)}">Open admin orders</a></p>` : ""}
    `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend admin email failed ${res.status}: ${err}`);
  }
}
