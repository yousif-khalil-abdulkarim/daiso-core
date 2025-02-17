/**
 * @module Lock
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILock } from "@/lock/contracts/lock.contract.js";
import { BaseEvent } from "@/event-bus/contracts/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import type { OneOrMore } from "@/utilities/types.js";
import { CORE, type TimeSpan } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyAcquiredLockEvent extends BaseEvent<{
    key: string;
    owner: string;
    ttl: TimeSpan | null;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyReleasedLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyForceReleasedLockEvent extends BaseEvent<{
    key: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class UnownedReleaseLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class UnownedRefreshLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyAlreadyAcquiredLockEvent extends BaseEvent<{
    key: string;
    owner: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyRefreshedLockEvent extends BaseEvent<{
    key: string;
    owner: string;
    ttl: TimeSpan;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
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
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
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
 * The <i>registerLockEventsToSerde</i> function registers all <i>{@link ILock}</i> related events with <i>IFlexibleSerde</i>, ensuring they will properly be serialized and deserialized.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
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
            .registerEvent(KeyAcquiredLockEvent, CORE)
            .registerEvent(KeyReleasedLockEvent, CORE)
            .registerEvent(UnownedReleaseLockEvent, CORE)
            .registerEvent(KeyAlreadyAcquiredLockEvent, CORE)
            .registerEvent(UnownedRefreshLockEvent, CORE)
            .registerEvent(UnexpectedErrorLockEvent, CORE);
    }
}
