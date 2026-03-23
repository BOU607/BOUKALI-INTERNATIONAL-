import type { Visit } from "./types";
import { addVisit as addVisitFile, getVisits as getVisitsFile } from "./store";
import { isKvConfigured } from "./kv-creds";
import { getRedisClient } from "./redis-client";

const MAX_VISITS = 500;
const KV_KEY = "miaha:visits";

/** Whether Redis/KV env vars are set (for admin UI status). */
export { isKvConfigured };

/**
 * Add a visit. Uses Redis (REST or TCP) when env vars are set, otherwise file.
 */
export async function addVisit(visit: Omit<Visit, "id" | "createdAt">): Promise<Visit> {
  const kv = await getRedisClient();
  if (kv) {
    const entry: Visit = {
      ...visit,
      id: `v-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      await kv.lpush(KV_KEY, entry);
      await kv.ltrim(KV_KEY, 0, MAX_VISITS - 1);
      return entry;
    } catch (e) {
      throw e;
    }
  }

  return addVisitFile(visit);
}

/**
 * Get recent visits. Uses Redis when configured, otherwise file.
 */
export async function getVisits(): Promise<Visit[]> {
  const kv = await getRedisClient();
  if (kv) {
    try {
      const list = (await kv.lrange(KV_KEY, 0, MAX_VISITS - 1)) as Visit[] | null;
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn("KV getVisits failed:", e);
      return [];
    }
  }
  return getVisitsFile();
}
