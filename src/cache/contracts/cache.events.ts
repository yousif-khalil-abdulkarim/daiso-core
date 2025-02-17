/**
 * @module Cache
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IGroupableCache } from "@/cache/contracts/cache.contract.js";
import { BaseEvent } from "@/event-bus/contracts/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import {
    CORE,
    type OneOrMore,
    type TimeSpan,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyFoundCacheEvent<TType = unknown> extends BaseEvent<{
    group: string;
    key: string;
    value: TType;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyNotFoundCacheEvent extends BaseEvent<{
    group: string;
    key: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyAddedCacheEvent<TType = unknown> extends BaseEvent<{
    group: string;
    key: string;
    value: TType;
    ttl: TimeSpan | null;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyUpdatedCacheEvent<TType = unknown> extends BaseEvent<{
    group: string;
    key: string;
    value: TType;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyRemovedCacheEvent extends BaseEvent<{
    group: string;
    key: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyIncrementedCacheEvent extends BaseEvent<{
    group: string;
    key: string;
    value: number;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeyDecrementedCacheEvent extends BaseEvent<{
    group: string;
    key: string;
    value: number;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class KeysClearedCacheEvent extends BaseEvent<{
    group: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export class UnexpectedCacheErrorEvent extends BaseEvent<{
    group: string;
    key?: string;
    value?: unknown;
    method: string;
    error: unknown;
}> {}

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
    | UnexpectedCacheErrorEvent;

/**
 * The <i>registerCacheEvents</i> function registers all <i>{@link IGroupableCache}</i> related events with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/contracts"```
 * @group Events
 */
export function registerCacheEvents(serde: OneOrMore<IFlexibleSerde>): void {
    if (!Array.isArray(serde)) {
        serde = [serde];
    }
    for (const serde_ of serde) {
        serde_
            .registerEvent(KeyFoundCacheEvent, CORE)
            .registerEvent(KeyNotFoundCacheEvent, CORE)
            .registerEvent(KeyAddedCacheEvent, CORE)
            .registerEvent(KeyUpdatedCacheEvent, CORE)
            .registerEvent(KeyRemovedCacheEvent, CORE)
            .registerEvent(KeyIncrementedCacheEvent, CORE)
            .registerEvent(KeyDecrementedCacheEvent, CORE)
            .registerEvent(KeysClearedCacheEvent, CORE)
            .registerEvent(UnexpectedCacheErrorEvent, CORE);
    }
}
