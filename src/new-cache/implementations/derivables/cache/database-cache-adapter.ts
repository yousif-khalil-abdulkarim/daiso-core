/**
 * @module Cache
 */

import {
    type IDatabaseCacheAdapter,
    type ICacheAdapter,
    type CacheAdapterAddSettings,
    type CacheAdapterIncrementSettings,
    type CacheAdapterPutSettings,
    type CacheAdapterUpdateAddSettings,
    type CacheEntry,
} from "@/new-cache/contracts/_module.js";

/**
 * @internal
 */
export class DatabaseCacheAdapter<TType = unknown>
    implements ICacheAdapter<TType>
{
    constructor(private readonly adapter: IDatabaseCacheAdapter<TType>) {}
    get(key: string): Promise<CacheEntry<TType> | null> {
        throw new Error("Method not implemented.");
    }
    getAndRemove(key: string): Promise<TType | null> {
        throw new Error("Method not implemented.");
    }
    add(settings: CacheAdapterAddSettings): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    put(settings: CacheAdapterPutSettings): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    update(settings: CacheAdapterUpdateAddSettings<TType>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    increment(settings: CacheAdapterIncrementSettings): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    removeMany(keys: string[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    removeAll(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    removeByKeyPrefix(prefix: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
