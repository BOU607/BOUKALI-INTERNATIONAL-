import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getRedisClient } from "./redis-client";
import type { PayoutReleaseRun } from "./types";

const KV_KEY = "miaha:payout_release_runs";
const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "payout-release-runs.json");
const MAX_RUNS = 50;

function readFileRuns(): PayoutReleaseRun[] {
  try {
    if (!existsSync(FILE)) return [];
    const parsed = JSON.parse(readFileSync(FILE, "utf-8")) as PayoutReleaseRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFileRuns(runs: PayoutReleaseRun[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(runs.slice(0, MAX_RUNS), null, 2));
}

export async function getPayoutReleaseRuns(): Promise<PayoutReleaseRun[]> {
  const kv = await getRedisClient();
  if (kv) {
    try {
      const raw = await kv.get(KV_KEY);
      if (Array.isArray(raw)) return (raw as PayoutReleaseRun[]).slice(0, MAX_RUNS);
      if (typeof raw === "string") {
        const parsed = JSON.parse(raw) as PayoutReleaseRun[];
        return Array.isArray(parsed) ? parsed.slice(0, MAX_RUNS) : [];
      }
    } catch {
      // fall back
    }
  }
  return readFileRuns();
}

export async function addPayoutReleaseRun(run: PayoutReleaseRun): Promise<void> {
  const kv = await getRedisClient();
  if (kv) {
    try {
      const runs = await getPayoutReleaseRuns();
      const next = [run, ...runs].slice(0, MAX_RUNS);
      await kv.set(KV_KEY, next);
      return;
    } catch {
      // fall back
    }
  }
  const runs = readFileRuns();
  writeFileRuns([run, ...runs]);
}
