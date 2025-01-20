/**
 * @module Cache
 */

import type { TimeSpan } from "@/utilities/_module";
import type { ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";

/**
 * @group Events
 */
export type CacheEvent = {
    group: string;
    adapter: ICacheAdapter<any>;
};

/**
 * This event will be triggered when cache is cleared.
 * @group Events
 */
export type KeysClearedCacheEvent = CacheEvent & {};

export type CacheEvents<TType = unknown> = {
    key_found: CacheEvent & {
        key: string;
        value: TType;
    };
    key_not_found: CacheEvent & {
        key: string;
    };
    key_added: CacheEvent & {
        key: string;
        value: TType;
        ttl: TimeSpan | null;
    };
    key_updated: CacheEvent & {
        key: string;
        value: TType;
    };
    key_removed: CacheEvent & {
        key: string;
    };
    key_incremented: CacheEvent & {
        key: string;
        value: number;
    };
    key_decremented: CacheEvent & {
        key: string;
        value: number;
    };
    keys_cleared: CacheEvent;
};
