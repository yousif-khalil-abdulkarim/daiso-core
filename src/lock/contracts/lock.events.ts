/**
 * @module Lock
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars

import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { ILockGetState } from "@/lock/contracts/lock.contract.js";

/**
 * The event is dispatched when a lock is aquired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type AcquiredLockEvent = {
    key: string;
    lockId: string;
    lock: ILockGetState;
    ttl: TimeSpan | null;
};

/**
 * The event is dispatched when a lock is released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type ReleasedLockEvent = {
    key: string;
    lockId: string;
    lock: ILockGetState;
};

/**
 * The event is dispatched when a lock is forcefully released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type ForceReleasedLockEvent = {
    key: string;
    lock: ILockGetState;
    hasReleased: boolean;
};

/**
 * The event is dispatched when trying to release a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type FailedReleaseLockEvent = {
    key: string;
    lockId: string;
    lock: ILockGetState;
};

/**
 * The event is dispatched when trying to refefresh a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type FailedRefreshLockEvent = {
    key: string;
    lockId: string;
    lock: ILockGetState;
};

/**
 * The event is dispatched when trying to acquire a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type UnavailableLockEvent = {
    key: string;
    lockId: string;
    lock: ILockGetState;
};

/**
 * The event is dispatched when a lock is refreshed.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type RefreshedLockEvent = {
    key: string;
    lockId: string;
    newTtl: TimeSpan;
    lock: ILockGetState;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type UnexpectedErrorLockEvent = {
    key: string;
    lockId: string;
    ttl: TimeSpan | null;
    error: unknown;
    lock: ILockGetState;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export const LOCK_EVENTS = {
    ACQUIRED: "ACQUIRED",
    RELEASED: "RELEASED",
    FAILED_RELEASE: "FAILED_RELEASE",
    FAILED_REFRESH: "FAILED_REFRESH",
    UNAVAILABLE: "UNAVAILABLE",
    FORCE_RELEASED: "FORCE_RELEASED",
    REFRESHED: "REFRESHED",
    UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type LockEventMap = {
    [LOCK_EVENTS.ACQUIRED]: AcquiredLockEvent;
    [LOCK_EVENTS.RELEASED]: ReleasedLockEvent;
    [LOCK_EVENTS.FAILED_RELEASE]: FailedReleaseLockEvent;
    [LOCK_EVENTS.FAILED_REFRESH]: FailedRefreshLockEvent;
    [LOCK_EVENTS.UNAVAILABLE]: UnavailableLockEvent;
    [LOCK_EVENTS.FORCE_RELEASED]: ForceReleasedLockEvent;
    [LOCK_EVENTS.REFRESHED]: RefreshedLockEvent;
    [LOCK_EVENTS.UNEXPECTED_ERROR]: UnexpectedErrorLockEvent;
};
