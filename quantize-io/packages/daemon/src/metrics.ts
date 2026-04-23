export interface MetricsSnapshot {
  request_count: number;
  bytes_in: number;
  bytes_out: number;
  cache_hits: number;
  cache_misses: number;
  cache_hit_ratio: number;
  uptime_ms: number;
  started_at: number;
}

export interface MetricsCollector {
  record(event: { bytesIn: number; bytesOut: number; cacheHit: boolean }): void;
  snapshot(): MetricsSnapshot;
}

export function createMetrics(): MetricsCollector {
  const startedAt = Date.now();
  let requestCount = 0;
  let bytesIn = 0;
  let bytesOut = 0;
  let cacheHits = 0;
  let cacheMisses = 0;

  return {
    record({ bytesIn: bIn, bytesOut: bOut, cacheHit }) {
      requestCount += 1;
      bytesIn += bIn;
      bytesOut += bOut;
      if (cacheHit) cacheHits += 1;
      else cacheMisses += 1;
    },
    snapshot() {
      const total = cacheHits + cacheMisses;
      return {
        request_count: requestCount,
        bytes_in: bytesIn,
        bytes_out: bytesOut,
        cache_hits: cacheHits,
        cache_misses: cacheMisses,
        cache_hit_ratio: total > 0 ? cacheHits / total : 0,
        uptime_ms: Date.now() - startedAt,
        started_at: startedAt,
      };
    },
  };
}
