import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";

import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

export interface CacheValue {
  compressed: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
  mode: string;
  timestamp: number;
}

export interface Cache {
  get(key: string): Promise<CacheValue | null>;
  set(key: string, value: CacheValue): Promise<void>;
  keyFor(content: string, model: string, mode: string): string;
}

export const DEFAULT_CACHE_ROOT = join(homedir(), ".quantize", "cache");

export function createFsCache(root: string = DEFAULT_CACHE_ROOT): Cache {
  const storage = createStorage<CacheValue>({
    driver: fsDriver({ base: root }),
  });

  const keyFor = (content: string, model: string, mode: string): string => {
    const hash = createHash("sha256");
    hash.update(content);
    hash.update("\0");
    hash.update(model);
    hash.update("\0");
    hash.update(mode);
    return hash.digest("hex");
  };

  return {
    keyFor,
    async get(key) {
      const hit = await storage.getItem(key);
      return hit ?? null;
    },
    async set(key, value) {
      await storage.setItem(key, value);
    },
  };
}

export function createMemoryCache(): Cache {
  const store = new Map<string, CacheValue>();
  return {
    keyFor(content, model, mode) {
      const hash = createHash("sha256");
      hash.update(content);
      hash.update("\0");
      hash.update(model);
      hash.update("\0");
      hash.update(mode);
      return hash.digest("hex");
    },
    async get(key) {
      return store.get(key) ?? null;
    },
    async set(key, value) {
      store.set(key, value);
    },
  };
}
