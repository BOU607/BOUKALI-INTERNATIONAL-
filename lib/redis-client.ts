/**
 * Single Redis access for the app:
 * - HTTPS REST: @vercel/kv (KV_REST_API_URL + KV_REST_API_TOKEN, Upstash-style)
 * - TCP: ioredis (KV_REDIS_URL or REDIS_URL as redis:// or rediss://) — Vercel Marketplace Redis
 */
import { getKvCreds } from "./kv-creds";

/** Normalise env values (copy-paste sometimes includes wrapping quotes). */
function tcpUrlFromEnv(): string {
  const raw = process.env.KV_REDIS_URL || process.env.REDIS_URL || "";
  return raw.trim().replace(/^["']|["']$/g, "");
}

export type RedisLike = {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<unknown>;
  lpush(key: string, value: unknown): Promise<number>;
  ltrim(key: string, start: number, stop: number): Promise<unknown>;
  lrange(key: string, start: number, stop: number): Promise<unknown[]>;
};

let tcpSingleton: import("ioredis").default | null = null;

export function hasTcpRedisUrl(): boolean {
  const u = (process.env.KV_REDIS_URL || process.env.REDIS_URL || "").trim();
  return u.startsWith("redis://") || u.startsWith("rediss://");
}

/** True if REST or TCP Redis is configured. */
export function hasAnyRedisConfig(): boolean {
  return getKvCreds() !== null || hasTcpRedisUrl();
}

export async function getRedisClient(): Promise<RedisLike | null> {
  const rest = getKvCreds();
  if (rest) {
    const { createClient } = await import("@vercel/kv");
    return createClient({ url: rest.url, token: rest.token }) as unknown as RedisLike;
  }

  const tcp = tcpUrlFromEnv();
  if (!tcp.startsWith("redis://") && !tcp.startsWith("rediss://")) {
    return null;
  }

  if (!tcpSingleton) {
    const { default: IORedis } = await import("ioredis");
    tcpSingleton = new IORedis(tcp, {
      maxRetriesPerRequest: null,
      connectTimeout: 10_000,
    });
  }
  const r = tcpSingleton;

  return {
    async get<T>(key: string): Promise<T | null> {
      const v = await r.get(key);
      if (v == null) return null;
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as unknown as T;
      }
    },
    async set(key: string, value: unknown) {
      const s = typeof value === "string" ? value : JSON.stringify(value);
      return r.set(key, s);
    },
    async lpush(key: string, value: unknown) {
      const s = typeof value === "string" ? value : JSON.stringify(value);
      return r.lpush(key, s);
    },
    async ltrim(key: string, start: number, stop: number) {
      return r.ltrim(key, start, stop);
    },
    async lrange(key: string, start: number, stop: number) {
      const arr = await r.lrange(key, start, stop);
      return arr.map((s) => {
        try {
          return JSON.parse(s);
        } catch {
          return s;
        }
      });
    },
  };
}
