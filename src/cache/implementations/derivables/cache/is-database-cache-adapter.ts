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
    const adapter_ = adapter as Record<string, (...args: Array<any>) => any>;
    return (
        typeof adapter_["find"] === "function" &&
        adapter_["find"].length === 1 &&
        typeof adapter_["transaction"] === "function" &&
        adapter_["transaction"].length === 1 &&
        typeof adapter_["update"] === "function" &&
        adapter_["update"].length === 2 &&
        typeof adapter_["removeMany"] === "function" &&
        typeof adapter_["removeAll"] === "function" &&
        adapter_["removeAll"].length === 0 &&
        typeof adapter_["removeByKeyPrefix"] === "function" &&
        adapter_["removeByKeyPrefix"].length === 1
    );
}
