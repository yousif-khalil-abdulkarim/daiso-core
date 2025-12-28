/**
 * @module Cache
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Key } from "@/namespace/namespace.js";
import type { ITimeSpan } from "@/time-span/contracts/_module.js";

/**
 * The event is dispatched when key is found.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type FoundCacheEvent<TType = unknown> = {
    key: Key;
    value: TType;
};

/**
 * The event is dispatched when key is not found.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type NotFoundCacheEvent = {
    key: Key;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export const WRITTEN_CACHE_EVENT_TYPES = {
    ADDED: "added",
    UPDATED: "updated",
    REMOVED: "removed",
    INCREMENTED: "incremented",
    DECREMENTED: "decremented",
} as const;

/**
 * The event is dispatched when key is added.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type AddedCacheEvent<TType = unknown> = {
    type: (typeof WRITTEN_CACHE_EVENT_TYPES)["ADDED"];
    key: Key;
    value: TType;
    ttl: ITimeSpan | null;
};

/**
 * The event is dispatched when key is updated.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type UpdatedCacheEvent<TType = unknown> = {
    type: (typeof WRITTEN_CACHE_EVENT_TYPES)["UPDATED"];
    key: Key;
    value: TType;
};

/**
 * The event is dispatched when key is removed.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type RemovedCacheEvent = {
    type: (typeof WRITTEN_CACHE_EVENT_TYPES)["REMOVED"];
    key: Key;
};

/**
 * The event is dispatched when key is incremented.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type IncrementedCacheEvent = {
    type: (typeof WRITTEN_CACHE_EVENT_TYPES)["INCREMENTED"];
    key: Key;
    value: number;
};

/**
 * The event is dispatched when key is decremented.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type DecrementedCacheEvent = {
    type: (typeof WRITTEN_CACHE_EVENT_TYPES)["DECREMENTED"];
    key: Key;
    value: number;
};

/**
 * The event is dispatched when key is updated or added.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type WrittenCacheEvent<TType = unknown> =
    | AddedCacheEvent<TType>
    | UpdatedCacheEvent<TType>
    | RemovedCacheEvent
    | IncrementedCacheEvent
    | DecrementedCacheEvent;

/**
 * The event is dispatched when all keys all cleared of the cache.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ClearedCacheEvent = {};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type UnexpectedErrorCacheEvent = {
    keys?: Key[];
    value?: unknown;
    method: string;
    error: unknown;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export const CACHE_EVENTS = {
    FOUND: "FOUND",
    NOT_FOUND: "NOT_FOUND",
    WRITTEN: "WRITTEN",
    CLEARED: "CLEARED",
    UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type CacheEventMap<TType = unknown> = {
    [CACHE_EVENTS.FOUND]: FoundCacheEvent<TType>;
    [CACHE_EVENTS.NOT_FOUND]: NotFoundCacheEvent;
    [CACHE_EVENTS.WRITTEN]: WrittenCacheEvent<TType>;
    [CACHE_EVENTS.CLEARED]: ClearedCacheEvent;
    [CACHE_EVENTS.UNEXPECTED_ERROR]: UnexpectedErrorCacheEvent;
};
