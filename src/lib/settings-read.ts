import prisma from "./db";
import { defaultFor, type SettingKey } from "./settings";

// Tiny in-memory cache with a 10s TTL. Admin writes call resetSettingsCache()
// so the writer node sees its own change instantly; other nodes catch up
// within TTL_MS. DB read itself is a single `SELECT * FROM "SystemSetting"`
// against a primary-keyed table (<20 rows) so the miss cost is trivial.
const TTL_MS = 10_000;
let cache: { values: Map<string, string>; fetchedAt: number } | null = null;

async function loadAll(): Promise<Map<string, string>> {
  const rows = await prisma.systemSetting.findMany({
    select: { key: true, value: true },
  });
  return new Map(rows.map((r) => [r.key, r.value]));
}

async function ensureCache(): Promise<Map<string, string>> {
  const now = Date.now();
  if (!cache || now - cache.fetchedAt > TTL_MS) {
    try {
      cache = { values: await loadAll(), fetchedAt: now };
    } catch (err) {
      console.error("[settings-read] load failed — falling back to defaults", err);
      if (!cache) cache = { values: new Map(), fetchedAt: now };
    }
  }
  return cache.values;
}

export function resetSettingsCache(): void {
  cache = null;
}

export async function getSetting(key: SettingKey): Promise<string> {
  const map = await ensureCache();
  return map.get(key) ?? defaultFor(key);
}

export async function getSettings<K extends SettingKey>(
  keys: readonly K[]
): Promise<Record<K, string>> {
  const map = await ensureCache();
  const out = {} as Record<K, string>;
  for (const k of keys) out[k] = map.get(k) ?? defaultFor(k);
  return out;
}

export async function getFlag(key: SettingKey): Promise<boolean> {
  const v = await getSetting(key);
  return v === "true";
}
