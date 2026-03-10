import type { Visit } from "./types";
import { addVisit as addVisitFile, getVisits as getVisitsFile } from "./store";

const MAX_VISITS = 500;
const KV_KEY = "miaha:visits";

/** Read Redis/KV credentials at runtime (supports both KV_* and UPSTASH_* names). */
function getKvCreds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  return null;
}

/** Whether Redis/KV env vars are set (for admin UI status). */
export function isKvConfigured(): boolean {
  return getKvCreds() !== null;
}

/**
 * Add a visit. Uses Redis (KV or Upstash) when env vars are set, otherwise file.
 */
export async function addVisit(visit: Omit<Visit, "id" | "createdAt">): Promise<Visit> {
  const creds = getKvCreds();
  if (creds) {
    const entry: Visit = {
      ...visit,
      id: `v-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      const { createClient } = await import("@vercel/kv");
      const kv = createClient({ url: creds.url, token: creds.token });
      await kv.lpush(KV_KEY, entry);
      await kv.ltrim(KV_KEY, 0, MAX_VISITS - 1);
      return entry;
    } catch (e) {
      // Don't fall back to file on Vercel (read-only FS). Surface the real Redis error.
      throw e;
    }
  }

  // File store builds id/createdAt; return that so caller matches persisted row.
  return addVisitFile(visit);
}

/**
 * Get recent visits. Uses Redis when configured, otherwise file.
 */
export async function getVisits(): Promise<Visit[]> {
  const creds = getKvCreds();
  if (creds) {
    try {
      const { createClient } = await import("@vercel/kv");
      const kv = createClient({ url: creds.url, token: creds.token });
      const list = (await kv.lrange(KV_KEY, 0, MAX_VISITS - 1)) as Visit[] | null;
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn("KV getVisits failed:", e);
      return [];
    }
  }
  return getVisitsFile();
}
