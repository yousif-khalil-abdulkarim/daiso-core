/**
 * @module Cache
 */

import {
    type CacheAdapterVariants,
    type IDatabaseCacheAdapter,
} from "@/cache/contracts/_module.js";

/**
 * @internal
 */
export function isDatabaseCacheAdapter<TType>(
    adapter: CacheAdapterVariants<TType>,
): adapter is IDatabaseCacheAdapter<TType> {
    const adapter_ = adapter as Record<string, (...args: any[]) => any>;
    return (
        typeof adapter_["find"] === "function" &&
        adapter_["find"].length === 1 &&
        typeof adapter_["insert"] === "function" &&
        adapter_["insert"].length === 1 &&
        typeof adapter_["updateExpired"] === "function" &&
        adapter_["updateExpired"].length === 1 &&
        typeof adapter_["updateUnexpired"] === "function" &&
        adapter_["updateUnexpired"].length === 1 &&
        typeof adapter_["incrementUnexpired"] === "function" &&
        adapter_["incrementUnexpired"].length === 1 &&
        typeof adapter_["removeExpiredMany"] === "function" &&
        typeof adapter_["removeUnexpiredMany"] === "function" &&
        typeof adapter_["removeAll"] === "function" &&
        adapter_["removeAll"].length === 0 &&
        typeof adapter_["removeByKeyPrefix"] === "function" &&
        adapter_["removeByKeyPrefix"].length === 1
    );
}
