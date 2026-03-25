import type { Order, OrderItem } from "./types";
import { getSellerById } from "./sellers-persist";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
/** Use your verified domain, e.g. "Miaha <orders@miahamarket.com>" */
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL || "Miaha Market <onboarding@resend.dev>";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend email failed ${res.status}: ${err}`);
  }
}

/** Notify each seller whose products are in the order. Runs in background, does not block. */
export async function notifySellersOfOrder(order: Order): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — seller notifications disabled");
    return;
  }

  const sellerIds = Array.from(new Set(order.items.map((i) => i.sellerId).filter((id): id is string => Boolean(id))));
  if (sellerIds.length === 0) return;

  for (const sellerId of sellerIds) {
    const seller = await getSellerById(sellerId);
    if (!seller?.email) continue;

    const myItems = order.items.filter((i) => i.sellerId === sellerId) as OrderItem[];
    const myTotal = myItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const itemsList = myItems
      .map((i) => `  • ${i.name} × ${i.quantity} — A$${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");

    const subject = `New order ${order.id} — A$${myTotal.toFixed(2)}`;
    const html = `
      <h2>New order received</h2>
      <p>Order ID: <strong>${order.id}</strong></p>
      <p>Customer: ${order.customer.name} (${order.customer.email})</p>
      <p>Shipping address: ${order.customer.address}</p>
      <hr/>
      <p><strong>Your items in this order:</strong></p>
      <pre style="font-family:sans-serif;white-space:pre-wrap;">${itemsList}</pre>
      <p><strong>Your total: A$${myTotal.toFixed(2)}</strong></p>
      <hr/>
      <p>Log in to your seller dashboard to view full order details.</p>
    `;

    try {
      await sendEmail(seller.email, subject, html);
    } catch (e) {
      console.error("Notify seller failed:", e);
    }
  }
}

/** Notify seller that payout transfer has been released after delivery confirmation. */
export async function notifySellerPayoutReleased(input: {
  sellerEmail: string;
  sellerName?: string;
  orderId: string;
  amount: number;
  currency: string;
  transferId: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — payout notifications disabled");
    return;
  }
  const amountLabel = `${input.amount.toFixed(2)} ${input.currency.toUpperCase()}`;
  const subject = `Payout released for order ${input.orderId} — ${amountLabel}`;
  const html = `
    <h2>Payout released</h2>
    <p>Hello ${input.sellerName || "Seller"},</p>
    <p>Your payout has been released for order <strong>${input.orderId}</strong>.</p>
    <p><strong>Amount:</strong> ${amountLabel}</p>
    <p><strong>Transfer ID:</strong> ${input.transferId}</p>
    <p>You can view details in your seller dashboard and Stripe account.</p>
  `;
  await sendEmail(input.sellerEmail, subject, html);
}
