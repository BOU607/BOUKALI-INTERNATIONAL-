# Miaha international market — Buy & Sell

A full-stack e-commerce website where people can **buy products**, **find services** (plumber, electrician, painter, etc.), **search jobs**, and you can **manage everything** from a protected admin area.

## What’s included

- **Storefront**: Home, products (by category), cart, **Stripe checkout**
- **Services**: Search plumbers, electrical, painters, carpenters, etc.
- **Jobs**: Job search and listings
- **Admin** (login protected): Products, services, jobs, orders & sales
- **Payments**: Stripe — customers pay by card; orders marked **paid** after success
- **Data**: JSON files in `data/` (products, orders, jobs, services)

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env.local` and set:

   - **Stripe**: `STRIPE_SECRET_KEY` (from [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key)
   - **NextAuth**: `NEXTAUTH_SECRET` (any long random string), `NEXTAUTH_URL` (e.g. `http://localhost:3000`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (your admin login)

3. **Run the app**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). Log in at `/admin/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Payments (Stripe)

- Checkout shows **Pay with card**; customer is sent to Stripe Checkout and redirected back on success.
- If `STRIPE_SECRET_KEY` is not set, checkout falls back to **Place order** (order created as pending, no payment).
- On Vercel, add `STRIPE_SECRET_KEY` in Project → Settings → Environment Variables.

## Admin login

- All `/admin/*` routes (except `/admin/login`) require sign-in.
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` (and on Vercel). Use a strong password.

## Tech stack

- **Next.js 14** (App Router), **React 18**, **TypeScript**, **Tailwind CSS**
- **Stripe** (Checkout), **NextAuth** (Credentials)
- Data: `data/products.json`, `data/orders.json`, `data/jobs.json`, `data/services.json`
