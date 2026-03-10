/**
 * Contact info from env. Set NEXT_PUBLIC_* in .env.local or Vercel.
 * Phone/WhatsApp: use international format (e.g. +1234567890, no spaces for WhatsApp link).
 */
export const contact = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@miahamarket.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "",
  googleMapLink: process.env.NEXT_PUBLIC_GOOGLE_MAP_LINK || "",
  googleMapEmbedSrc: process.env.NEXT_PUBLIC_GOOGLE_MAP_EMBED_SRC || "",
};

/** WhatsApp link (wa.me with number without + or spaces) */
export function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}
