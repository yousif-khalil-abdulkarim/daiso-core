/**
 * @module Lock
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILock } from "@/lock/contracts/lock.contract.js";
import { BaseEvent } from "@/event-bus/contracts/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import type { OneOrMore } from "@/utilities/_module-exports.js";
import {
    CORE,
    resolveOneOrMore,
    type TimeSpan,
} from "@/utilities/_module-exports.js";

/**
 * The event is dispatched when a lock is aquired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export class KeyAcquiredLockEvent extends BaseEvent<{
    key: string;
    owner: string;
    ttl: TimeSpan | null;
}> {}

/**
 * The event is dispatched when a lock is released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export class KeyReleasedLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 * The event is dispatched when a lock is forcefully released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export class KeyForceReleasedLockEvent extends BaseEvent<{
    key: string;
}> {}

/**
 * The event is dispatched when trying to release a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export class UnownedReleaseLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 * The event is dispatched when trying to refefresh a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export class UnownedRefreshLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 * The event is dispatched when trying to acquire a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export class KeyAlreadyAcquiredLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 * The event is dispatched when a lock is refreshed.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export class KeyRefreshedLockEvent extends BaseEvent<{
    key: string;
    owner: string;
    ttl: TimeSpan;
}> {}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export class UnexpectedErrorLockEvent extends BaseEvent<{
    key: string;
    owner: string;
    ttl: TimeSpan | null;
    error: unknown;
}> {}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export const LOCK_EVENTS = {
    KeyAcquired: KeyAcquiredLockEvent,
    KeyReleased: KeyReleasedLockEvent,
    UnownedRelease: UnownedReleaseLockEvent,
    UnownedRefresh: UnownedRefreshLockEvent,
    KeyAlreadyAcquired: KeyAlreadyAcquiredLockEvent,
    KeyForceReleased: KeyForceReleasedLockEvent,
    KeyRefreshed: KeyRefreshedLockEvent,
    UnexpectedError: UnexpectedErrorLockEvent,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type LockEvents =
    | KeyAcquiredLockEvent
    | KeyReleasedLockEvent
    | UnownedReleaseLockEvent
    | UnownedRefreshLockEvent
    | KeyAlreadyAcquiredLockEvent
    | KeyForceReleasedLockEvent
    | KeyRefreshedLockEvent
    | UnexpectedErrorLockEvent;

/**
 * The `registerLockEventsToSerde` function registers all {@link ILock | `ILock`} related events with `IFlexibleSerde`, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export function registerLockEventsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    for (const serde_ of resolveOneOrMore(serde)) {
        serde_
            .registerEvent(KeyAcquiredLockEvent, CORE)
            .registerEvent(KeyReleasedLockEvent, CORE)
            .registerEvent(UnownedReleaseLockEvent, CORE)
            .registerEvent(KeyAlreadyAcquiredLockEvent, CORE)
            .registerEvent(UnownedRefreshLockEvent, CORE)
            .registerEvent(UnexpectedErrorLockEvent, CORE);
    }
}
