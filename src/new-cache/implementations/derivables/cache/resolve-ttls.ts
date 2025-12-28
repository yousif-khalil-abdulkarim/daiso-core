/**
 * @module Cache
 */

import { TimeSpan } from "@/time-span/implementations/_module.js";
import { timeSpanWithJitter } from "@/new-cache/implementations/derivables/cache/time-span-with-jitter.js";
import type { CacheWriteSettings } from "@/new-cache/contracts/_module.js";

/**
 * @internal
 */
export type ResolveTtlsReturn = {
    ttl: TimeSpan | null;
    staleTtl: TimeSpan;
};

export type ResolveTtlDefaults = {
    randomValue: number;
    defaultTtl: TimeSpan | null;
    defaultStaleTtl: TimeSpan;
    defaultJitter: number | null;
};

/**
 * @internal
 */
export function resolveTtls(
    settings: CacheWriteSettings,
    defaults: ResolveTtlDefaults,
): ResolveTtlsReturn {
    let { ttl, jitter, staleTtl } = settings;
    const { randomValue, defaultTtl, defaultStaleTtl, defaultJitter } =
        defaults;

    if (ttl === undefined) {
        ttl = defaultTtl;
    }
    if (jitter === undefined) {
        jitter = defaultJitter;
    }
    if (staleTtl === undefined) {
        staleTtl = defaultStaleTtl;
    }
    if (ttl !== null && TimeSpan.fromTimeSpan(ttl).lt(staleTtl)) {
        staleTtl = ttl;
    }

    if (ttl !== null) {
        ttl = timeSpanWithJitter(ttl, jitter, randomValue);
    }
    staleTtl = timeSpanWithJitter(staleTtl, jitter, randomValue);

    return {
        ttl: ttl === null ? null : TimeSpan.fromTimeSpan(ttl),
        staleTtl: TimeSpan.fromTimeSpan(staleTtl),
    };
}
