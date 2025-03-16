/**
 * @module Cache
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IGroupableCache } from "@/cache/contracts/cache.contract.js";
import { BaseEvent } from "@/event-bus/contracts/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import {
    CORE,
    resolveOneOrMore,
    type OneOrMore,
    type TimeSpan,
} from "@/utilities/_module-exports.js";

/**
 * The event is dispatched when key is found.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyFoundCacheEvent<TType = unknown> extends BaseEvent<{
    group: string | null;
    key: string;
    value: TType;
}> {}

/**
 * The event is dispatched when key is not found.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyNotFoundCacheEvent extends BaseEvent<{
    group: string | null;
    key: string;
}> {}

/**
 * The event is dispatched when key is added.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyAddedCacheEvent<TType = unknown> extends BaseEvent<{
    group: string | null;
    key: string;
    value: TType;
    ttl: TimeSpan | null;
}> {}

/**
 * The event is dispatched when key is updated.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyUpdatedCacheEvent<TType = unknown> extends BaseEvent<{
    group: string | null;
    key: string;
    value: TType;
}> {}

/**
 * The event is dispatched when key is removed.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyRemovedCacheEvent extends BaseEvent<{
    group: string | null;
    key: string;
}> {}

/**
 * The event is dispatched when key is incremented.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyIncrementedCacheEvent extends BaseEvent<{
    group: string | null;
    key: string;
    value: number;
}> {}

/**
 * The event is dispatched when key is decremented.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyDecrementedCacheEvent extends BaseEvent<{
    group: string | null;
    key: string;
    value: number;
}> {}

/**
 * The event is dispatched when all keys all cleared.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeysClearedCacheEvent extends BaseEvent<{
    group: string | null;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class UnexpectedErrorCacheEvent extends BaseEvent<{
    group: string | null;
    keys?: string[];
    value?: unknown;
    method: string;
    error: unknown;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export const CACHE_EVENTS = {
    KeyFound: KeyFoundCacheEvent,
    KeyNotFound: KeyNotFoundCacheEvent,
    KeyAdded: KeyAddedCacheEvent,
    KeyUpdated: KeyUpdatedCacheEvent,
    KeyRemoved: KeyRemovedCacheEvent,
    KeyIncremented: KeyIncrementedCacheEvent,
    KeyDecremented: KeyDecrementedCacheEvent,
    KeysCleared: KeysClearedCacheEvent,
    UnexpectedError: UnexpectedErrorCacheEvent,
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export type CacheEvents<TType = unknown> =
    | KeyFoundCacheEvent<TType>
    | KeyNotFoundCacheEvent
    | KeyAddedCacheEvent<TType>
    | KeyUpdatedCacheEvent<TType>
    | KeyRemovedCacheEvent
    | KeyIncrementedCacheEvent
    | KeyDecrementedCacheEvent
    | KeysClearedCacheEvent
    | UnexpectedErrorCacheEvent;

/**
 * The <i>registerCacheEventsToSerde</i> function registers all <i>{@link IGroupableCache}</i> related events with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export function registerCacheEventsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerEvent(KeyFoundCacheEvent, CORE)
            .registerEvent(KeyNotFoundCacheEvent, CORE)
            .registerEvent(KeyAddedCacheEvent, CORE)
            .registerEvent(KeyUpdatedCacheEvent, CORE)
            .registerEvent(KeyRemovedCacheEvent, CORE)
            .registerEvent(KeyIncrementedCacheEvent, CORE)
            .registerEvent(KeyDecrementedCacheEvent, CORE)
            .registerEvent(KeysClearedCacheEvent, CORE)
            .registerEvent(UnexpectedErrorCacheEvent, CORE);
    }
}
