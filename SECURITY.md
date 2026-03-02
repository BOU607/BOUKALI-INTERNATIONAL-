# Security

This app is hardened against common attacks. Summary of what’s in place:

## 1. HTTP security headers

- **X-Frame-Options: DENY** – Reduces clickjacking (site can’t be embedded in iframes).
- **X-Content-Type-Options: nosniff** – Stops MIME sniffing.
- **Referrer-Policy** – Limits referrer data sent to other sites.
- **Permissions-Policy** – Disables camera, microphone, geolocation.
- **Content-Security-Policy (CSP)** – Restricts where scripts, styles, images, and connections can load (self, Stripe, fonts).
- **X-XSS-Protection** – Extra XSS filtering in supporting browsers.
- **poweredByHeader: false** – Hides “X-Powered-By: Next.js”.

Headers are set in `next.config.js` and reinforced in `middleware.ts` on all responses.

## 2. API protection

- **GET /api/orders** – **Admin only.** Returns 401 Unauthorized if the user is not logged in (JWT). Stops anyone from listing all orders.
- **PATCH /api/orders/[id]** – **Admin only.** Only authenticated admins can change order status.
- **POST /api/orders** and **POST /api/checkout-session** – All request bodies are **validated and sanitized** (length limits, email format, item limits, no raw HTML/script). Reduces injection and abuse.

## 3. Input validation and sanitization (`lib/security.ts`)

- **sanitizeString()** – Trims and length-limits text; strips `<script>`, `javascript:`, and `on*=` to reduce XSS.
- **isValidEmail()** – Ensures valid email format and length.
- **validateOrderPayload()** – Checks order shape, max items (50), max total, required customer fields.
- **sanitizeOrderItems()** – Ensures each item has valid productId, name, price, quantity, image (sanitized).

Limits: order total cap (e.g. 1M), max 50 items per order, string length caps on names/addresses.

## 4. Admin and auth

- **/admin** (except `/admin/login`) is protected by middleware; unauthenticated users are redirected to login.
- NextAuth JWT with `NEXTAUTH_SECRET`; admin credentials in env only (never in client).

## 5. What you should do

- Keep **NEXTAUTH_SECRET**, **STRIPE_SECRET_KEY**, **ADMIN_EMAIL**, **ADMIN_PASSWORD** in env only; never commit them.
- On Vercel, use **Environment Variables** and enable **Vercel Firewall** / DDoS protection if available.
- Run **`npm audit`** regularly and fix high/critical issues.
- Prefer **HTTPS** in production (Vercel provides it); set **NEXTAUTH_URL** to your `https://` URL.
- For stronger rate limiting (e.g. login or checkout), add a rate limiter (e.g. Upstash Redis) in front of sensitive APIs.

## Viruses and malware

- The app does not execute user-uploaded files or binaries; it’s a storefront and admin UI.
- “Virus” protection here means: **no arbitrary file execution**, **sanitized inputs**, **CSP and headers** to reduce drive-by and XSS. For server and CI, use standard antivirus and keep OS and Node/npm up to date.
