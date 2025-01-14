/**
 * @module Cache
 */

import type { TimeSpan } from "@/utilities/_module";
import type { ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ICache } from "@/cache/contracts/cache.contract";

/**
 * Name of all the events of <i>{@link ICache}</i>.
 * @group Events
 */
export const CACHE_EVENTS = {
    KEY_FOUND: "key_found",
    KEY_NOT_FOUND: "key_not_found",
    KEY_ADDED: "key_added",
    KEY_UPDATED: "key_updated",
    KEY_REMOVED: "key_removed",
    KEYS_CLEARED: "keys_cleared",
    KEY_INCREMENTED: "key_incremented",
    KEY_DECREMENTED: "key_decremented",
} as const;

/**
 * @group Events
 */
export type CacheEventNames = (typeof CACHE_EVENTS)[keyof typeof CACHE_EVENTS];

/**
 * @group Events
 */
export type CacheEvent = {
    namespace: string;
    adapter: ICacheAdapter<any>;
};

/**
 * @group Events
 */
export type KeyFoundCacheEvent<TType = unknown> = CacheEvent & {
    type: (typeof CACHE_EVENTS)["KEY_FOUND"];
    key: string;
    value: TType;
};

/**
 * @group Events
 */
export type KeyNotFoundCacheEvent = CacheEvent & {
    type: (typeof CACHE_EVENTS)["KEY_NOT_FOUND"];
    key: string;
};

/**
 * @group Events
 */
export type KeyAddedCacheEvent<TType = unknown> = CacheEvent & {
    type: (typeof CACHE_EVENTS)["KEY_ADDED"];
    key: string;
    value: TType;
    ttl: TimeSpan | null;
};

/**
 * @group Events
 */
export type KeyUpdatedCacheEvent<TType = unknown> = CacheEvent & {
    type: (typeof CACHE_EVENTS)["KEY_UPDATED"];
    key: string;
    value: TType;
};

/**
 * @group Events
 */
export type KeyIncrementedCacheEvent = CacheEvent & {
    type: (typeof CACHE_EVENTS)["KEY_INCREMENTED"];
    key: string;
    value: number;
};

/**
 * @group Events
 */
export type KeyDecrementedCacheEvent = CacheEvent & {
    type: (typeof CACHE_EVENTS)["KEY_DECREMENTED"];
    key: string;
    value: number;
};

/**
 * @group Events
 */
export type KeyRemovedCacheEvent = CacheEvent & {
    type: (typeof CACHE_EVENTS)["KEY_REMOVED"];
    key: string;
};

/**
 * This event will be triggered when cache is cleared.
 * @group Events
 */
export type KeysClearedCacheEvent = CacheEvent & {
    type: (typeof CACHE_EVENTS)["KEYS_CLEARED"];
};

/**
 * @group Events
 */
export type AllCacheEvents<TType> =
    | KeyFoundCacheEvent<TType>
    | KeyNotFoundCacheEvent
    | KeyAddedCacheEvent<TType>
    | KeyUpdatedCacheEvent<TType>
    | KeyRemovedCacheEvent
    | KeysClearedCacheEvent
    | KeyIncrementedCacheEvent
    | KeyDecrementedCacheEvent;
