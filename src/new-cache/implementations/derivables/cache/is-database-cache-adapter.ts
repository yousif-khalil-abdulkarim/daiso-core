/**
 * @module Cache
 */

import type { ICacheAdapter } from "@/new-cache/contracts/_module-exports.js";
import type { IDatabaseCacheAdapter } from "@/new-cache/contracts/_module-exports.js";
import type { AnyFunction } from "@/utilities/types.js";

/**
 * @internal
 */
export function isDatabaseCacheAdapter<TType>(
    adapter: ICacheAdapter<TType> | IDatabaseCacheAdapter<TType>,
): adapter is IDatabaseCacheAdapter<TType> {
    const adapter_ = adapter as Record<string, AnyFunction>;
    return (
        typeof adapter_["find"] === "function" &&
        typeof adapter_["insert"] === "function" &&
        typeof adapter_["upsert"] === "function" &&
        typeof adapter_["updateExpired"] === "function" &&
        typeof adapter_["updateUnexpired"] === "function" &&
        typeof adapter_["incrementUnexpired"] === "function" &&
        typeof adapter_["removeExpiredMany"] === "function" &&
        typeof adapter_["removeUnexpiredMany"] === "function" &&
        typeof adapter_["removeByKeyPrefix"] === "function"
    );
}
