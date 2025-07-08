/**
 * @module Lock
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars

import type { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * The event is dispatched when a lock is aquired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type AcquiredLockEvent = {
    key: string;
    owner: string;
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
    owner: string;
};

/**
 * The event is dispatched when a lock is forcefully released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type ForceReleasedLockEvent = {
    key: string;
};

/**
 * The event is dispatched when trying to release a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type UnownedReleaseTryLockEvent = {
    key: string;
    owner: string;
};

/**
 * The event is dispatched when trying to refefresh a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type UnownedRefreshTryLockEvent = {
    key: string;
    owner: string;
};

/**
 * The event is dispatched when trying to acquire a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type UnavailableLockEvent = {
    key: string;
    owner: string;
};

/**
 * The event is dispatched when a lock is refreshed.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type RefreshedLockEvent = {
    key: string;
    owner: string;
    ttl: TimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export type UnexpectedErrorLockEvent = {
    key: string;
    owner: string;
    ttl: TimeSpan | null;
    error: unknown;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Events
 */
export const LOCK_EVENTS = {
    ACQUIRED: "ACQUIRED",
    RELEASED: "RELEASED",
    UNOWNED_RELEASE_TRY: "UNOWNED_RELEASE_TRY",
    UNOWNED_REFRESH_TRY: "UNOWNED_REFRESH_TRY",
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
    [LOCK_EVENTS.UNOWNED_RELEASE_TRY]: UnownedReleaseTryLockEvent;
    [LOCK_EVENTS.UNOWNED_REFRESH_TRY]: UnownedRefreshTryLockEvent;
    [LOCK_EVENTS.UNAVAILABLE]: UnavailableLockEvent;
    [LOCK_EVENTS.FORCE_RELEASED]: ForceReleasedLockEvent;
    [LOCK_EVENTS.REFRESHED]: RefreshedLockEvent;
    [LOCK_EVENTS.UNEXPECTED_ERROR]: UnexpectedErrorLockEvent;
};
