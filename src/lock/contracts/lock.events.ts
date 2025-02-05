/**
 * @module Lock
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILock } from "@/lock/contracts/lock.contract";
import { BaseEvent } from "@/event-bus/contracts/_module";
import type { IFlexibleSerde } from "@/serde/contracts/_module";
import type { OneOrMore } from "@/utilities/types";
import type { TimeSpan } from "@/utilities/_module";

/**
 * @group Events
 */
export class KeyAcquiredLockEvent extends BaseEvent<{
    key: string;
    owner: string;
    ttl: TimeSpan | null;
}> {}

/**
 * @group Events
 */
export class KeyReleasedLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 * @group Events
 */
export class KeyForceReleasedLockEvent extends BaseEvent<{
    key: string;
}> {}

/**
 * @group Events
 */
export class UnownedReleaseLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 * @group Events
 */
export class UnownedRefreshLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 * @group Events
 */
export class KeyAlreadyAcquiredLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 * @group Events
 */
export class KeyRefreshedLockEvent extends BaseEvent<{
    key: string;
    owner: string;
    ttl: TimeSpan;
}> {}

/**
 * @group Events
 */
export type LockEvents =
    | KeyAcquiredLockEvent
    | KeyReleasedLockEvent
    | UnownedReleaseLockEvent
    | UnownedRefreshLockEvent
    | KeyAlreadyAcquiredLockEvent
    | KeyForceReleasedLockEvent
    | KeyRefreshedLockEvent;

/**
 * The <i>registerLockEventsToSerde</i> function registers all <i>{@link ILock}</i> related events with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 * @group Events
 */
export function registerLockEventsToSerde(
    serde: OneOrMore<IFlexibleSerde>,
): void {
    if (!Array.isArray(serde)) {
        serde = [serde];
    }
    for (const serde_ of serde) {
        serde_
            .registerEvent(KeyAcquiredLockEvent)
            .registerEvent(KeyReleasedLockEvent)
            .registerEvent(UnownedReleaseLockEvent)
            .registerEvent(KeyAlreadyAcquiredLockEvent)
            .registerEvent(UnownedRefreshLockEvent);
    }
}
