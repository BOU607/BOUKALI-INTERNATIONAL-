import type { Order, OrderItem } from "./types";
import { getSellerById } from "./sellers-persist";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
/** Use your verified domain, e.g. "Miaha <orders@miahamarket.com>" */
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL || "Miaha Market <onboarding@resend.dev>";

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
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [seller.email],
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Resend email failed:", res.status, err);
      }
    } catch (e) {
      console.error("Notify seller failed:", e);
    }
  }
}
