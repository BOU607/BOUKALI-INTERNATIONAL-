import type { Visit } from "./types";
import { addVisit as addVisitFile, getVisits as getVisitsFile } from "./store";

const MAX_VISITS = 500;
const KV_KEY = "miaha:visits";

/**
 * Add a visit. Uses Vercel KV when KV_REST_API_URL is set (so visits persist on Vercel), otherwise file.
 */
export async function addVisit(visit: Omit<Visit, "id" | "createdAt">): Promise<Visit> {
  const entry: Visit = {
    ...visit,
    id: `v-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = await import("@vercel/kv");
      await kv.lpush(KV_KEY, entry);
      await kv.ltrim(KV_KEY, 0, MAX_VISITS - 1);
      return entry;
    } catch (e) {
      console.warn("KV addVisit failed:", e);
    }
  }

  addVisitFile(visit);
  return entry;
}

/**
 * Get recent visits. Uses Vercel KV when configured, otherwise file.
 */
export async function getVisits(): Promise<Visit[]> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = await import("@vercel/kv");
      const list = (await kv.lrange(KV_KEY, 0, MAX_VISITS - 1)) as Visit[] | null;
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn("KV getVisits failed:", e);
      return [];
    }
  }
  return getVisitsFile();
}
