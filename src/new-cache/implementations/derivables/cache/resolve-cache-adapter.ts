/**
 * @module Cache
 */
import type { CacheAdapterVariants } from "@/new-cache/contracts/_module.js";
import type { ICacheAdapter } from "@/new-cache/contracts/_module.js";
import { isDatabaseCacheAdapter } from "@/new-cache/implementations/derivables/cache/is-database-cache-adapter.js";
import { DatabaseCacheAdapter } from "@/new-cache/implementations/derivables/cache/database-cache-adapter.js";

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
