# BOUKALI INTERNATIONAL — Buy & Sell

A full-stack e-commerce website where people can **buy products** and you can **manage sales** from an admin area.

## What’s included

- **Storefront**: Home, product list, product detail, cart, checkout
- **Admin**: Dashboard, add/edit/delete products, view orders and total sales, update order status
- **API**: REST endpoints for products and orders
- **Data**: Stored in JSON files in the `data/` folder (created on first run)

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the app**

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing and “how it works” |
| Products | `/products` | Browse all products |
| Product | `/products/[id]` | Product detail and add to cart |
| Cart | `/cart` | Review and edit cart |
| Checkout | `/checkout` | Customer info and place order |
| Admin dashboard | `/admin` | Overview (products count, orders, total sales) |
| Admin products | `/admin/products` | List, add, edit, delete products |
| Admin orders | `/admin/orders` | List orders and update status (pending → paid → shipped → delivered) |

## Tech stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- Data stored in `data/products.json` and `data/orders.json`

## Next steps

- Add **authentication** (e.g. NextAuth) to protect `/admin`
- Connect a **database** (e.g. PostgreSQL, SQLite) instead of JSON files
- Add **payments** (e.g. Stripe) in checkout
- Add **search and filters** on the products page
