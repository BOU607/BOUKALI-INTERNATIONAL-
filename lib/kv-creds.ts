/**
 * Redis/KV REST credentials for @vercel/kv (@upstash/redis).
 * Needs HTTPS REST URL + token — NOT redis:// TCP URLs.
 */
export function getKvCreds(): { url: string; token: string } | null {
  const pairs: Array<[string | undefined, string | undefined]> = [
    [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN],
    [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN],
    [process.env["kv_REST_API_URL"], process.env["kv_REST_API_TOKEN"]],
    [process.env.STORAGE_REST_API_URL, process.env.STORAGE_REST_API_TOKEN],
    [process.env.REDIS_REST_API_URL, process.env.REDIS_REST_API_TOKEN],
    // Vercel Marketplace Redis often sets these (HTTPS REST + token)
    [
      httpsRestUrl(process.env.REDIS_URL),
      process.env.REDIS_TOKEN,
    ],
    [
      httpsRestUrl(process.env["kv_REDIS_URL"]),
      process.env["kv_REDIS_TOKEN"] || process.env.REDIS_TOKEN,
    ],
  ];
  for (const [url, token] of pairs) {
    if (url && token) return { url: url.replace(/\/$/, ""), token };
  }
  return null;
}

function httpsRestUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  if (t.startsWith("https://")) return t;
  return undefined;
}

/** REST (HTTPS) or TCP redis:// URL — both work via lib/redis-client */
export function isKvConfigured(): boolean {
  if (getKvCreds() !== null) return true;
  const u = (process.env.KV_REDIS_URL || process.env.REDIS_URL || "").trim();
  return u.startsWith("redis://") || u.startsWith("rediss://");
}
