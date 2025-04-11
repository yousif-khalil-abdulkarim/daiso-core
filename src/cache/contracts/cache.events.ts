/**
 * @module Cache
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * The event is dispatched when key is found.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type FoundCacheEventt<TType = unknown> = {
    key: string;
    value: TType;
};

/**
 * The event is dispatched when key is not found.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type NotFoundCacheEvent = {
    key: string;
};

/**
 * The event is dispatched when key is added.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type AddedCacheEvent<TType = unknown> = {
    type: "added";
    key: string;
    value: TType;
    ttl: TimeSpan | null;
};

/**
 * The event is dispatched when key is updated.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type UpdatedCacheEvent<TType = unknown> = {
    type: "updated";
    key: string;
    value: TType;
};

/**
 * The event is dispatched when key is removed.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type RemovedCacheEvent = {
    type: "removed";
    key: string;
};

/**
 * The event is dispatched when key is incremented.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type IncrementedCacheEvent = {
    type: "incremented";
    key: string;
    value: number;
};

/**
 * The event is dispatched when key is decremented.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/contracts"`
 * @group Events
 */
export type DecrementedCacheEvent = {
    type: "decremented";
    key: string;
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
    keys?: string[];
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
    [CACHE_EVENTS.FOUND]: FoundCacheEventt<TType>;
    [CACHE_EVENTS.NOT_FOUND]: NotFoundCacheEvent;
    [CACHE_EVENTS.WRITTEN]: WrittenCacheEvent<TType>;
    [CACHE_EVENTS.CLEARED]: ClearedCacheEvent;
    [CACHE_EVENTS.UNEXPECTED_ERROR]: UnexpectedErrorCacheEvent;
};
