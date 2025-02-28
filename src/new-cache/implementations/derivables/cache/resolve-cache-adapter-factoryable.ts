/**
 * @module Cache
 */

import type { ICacheAdapter } from "@/new-cache/contracts/_module-exports.js";
import type { IDatabaseCacheAdapter } from "@/new-cache/contracts/_module-exports.js";
import {
    resolveFactoryable,
    type Factoryable,
} from "@/utilities/_module-exports.js";
import { DatabaseCacheAdapter } from "@/new-cache/implementations/derivables/cache/_module.js";
import type { AnyFunction } from "@/utilities/types.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/derivables"```
 * @group Derivables
 */
export type CacheAdapterFactoryable<TType> = Factoryable<
    string,
    ICacheAdapter<TType> | IDatabaseCacheAdapter<TType>
>;

/**
 * @internal
 */
function isDatabaseCacheAdapter<TType>(
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

/**
 * @internal
 */
function resolveCacheAdapter<TType>(
    adapter: ICacheAdapter<TType> | IDatabaseCacheAdapter<TType>,
): ICacheAdapter<TType> {
    if (isDatabaseCacheAdapter<TType>(adapter)) {
        return new DatabaseCacheAdapter(adapter);
    }
    return adapter;
}

/**
 * @internal
 */
export async function resolveCacheAdapterFactoryable<TType>(
    factoryable: CacheAdapterFactoryable<TType>,
    rootPrefix: string,
): Promise<ICacheAdapter<TType>> {
    const adapter = await resolveFactoryable(factoryable, rootPrefix);
    return resolveCacheAdapter(adapter);
}
