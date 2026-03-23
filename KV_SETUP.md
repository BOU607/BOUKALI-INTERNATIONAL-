# Set up Vercel KV (Database)

Seller registration, products, and orders need a database. On Vercel, use **Vercel KV** (free tier available).

## Steps

1. Go to [vercel.com](https://vercel.com) → your project (**boukali-international-jgjp**)
2. Click **Storage** in the top menu
3. Click **Create Database**
4. Select **KV** (Redis)
5. Name it (e.g. `miaha-kv`) and click **Create**
6. On the database page, click **Connect Project** and select your project
7. Vercel will add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your project automatically
8. **Redeploy** your project (Deployments → ⋮ → Redeploy)

After redeploying, seller registration will work.

## Alternative: Upstash Redis

You can also use [Upstash](https://upstash.com) (free tier):

1. Create account at upstash.com
2. Create a Redis database
3. Copy the REST URL and REST Token
4. In Vercel → Project → Settings → Environment Variables, add:
   - `KV_REST_API_URL` = your Upstash REST URL
   - `KV_REST_API_TOKEN` = your Upstash REST Token
5. Redeploy

## Vercel Marketplace Redis (`KV_REDIS_URL`)

If Vercel only gives you **`KV_REDIS_URL`** (`redis://` or `rediss://`), that is supported. The app uses TCP via `ioredis` when REST credentials are not set.

- Ensure **`KV_REDIS_URL`** is set on the project (often added automatically when you connect the store).
- Do **not** leave half-filled **`KV_REST_API_URL`** / **`KV_REST_API_TOKEN`** — remove them if you are not using REST, or the app may try REST first and fail.
