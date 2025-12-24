/**
 * @module Cache
 */
import type { CacheAdapterVariants } from "@/cache/contracts/_module.js";
import type { ICacheAdapter } from "@/cache/contracts/_module.js";
import { isDatabaseCacheAdapter } from "@/cache/implementations/derivables/cache/is-database-cache-adapter.js";
import { DatabaseCacheAdapter } from "@/cache/implementations/derivables/cache/database-cache-adapter.js";

/**
 * @internal
 */
export function resolveCacheAdapter<TType>(
    adapter: CacheAdapterVariants<TType>,
): ICacheAdapter<TType> {
    if (isDatabaseCacheAdapter(adapter)) {
        return new DatabaseCacheAdapter(adapter);
    }
    return adapter;
}
