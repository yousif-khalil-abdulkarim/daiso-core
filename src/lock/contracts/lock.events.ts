/**
 * @module Lock
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILock } from "@/lock/contracts/lock.contract.js";
import { MessageBase } from "@/event-bus/contracts/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import type { OneOrMore } from "@/utilities/types.js";
import {
    CORE,
    resolveOneOrMore,
    type TimeSpan,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyAcquiredLockEvent extends MessageBase<{
    key: string;
    owner: string;
    ttl: TimeSpan | null;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyReleasedLockEvent extends MessageBase<{
    key: string;
    owner: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyForceReleasedLockEvent extends MessageBase<{
    key: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class UnownedReleaseLockEvent extends MessageBase<{
    key: string;
    owner: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class UnownedRefreshLockEvent extends MessageBase<{
    key: string;
    owner: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyAlreadyAcquiredLockEvent extends MessageBase<{
    key: string;
    owner: string;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class KeyRefreshedLockEvent extends MessageBase<{
    key: string;
    owner: string;
    ttl: TimeSpan;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Events
 */
export class UnexpectedErrorLockEvent extends MessageBase<{
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
