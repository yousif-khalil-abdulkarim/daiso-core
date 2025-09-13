/**
 * @module SharedLock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { ISharedLockGetState } from "@/shared-lock/contracts/shared-lock.contract.js";

/**
 * The event is dispatched when a lock is aquired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type AcquiredWriterLockEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
    ttl: TimeSpan | null;
};

/**
 * The event is dispatched when a lock is released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type ReleasedWriterLockEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
};

/**
 * The event is dispatched when a lock is forcefully released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type ForceReleasedWriterLockEvent = {
    key: string;
    sharedLock: ISharedLockGetState;
    hasReleased: boolean;
};

/**
 * The event is dispatched when trying to release a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type FailedReleaseWriterLockEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
};

/**
 * The event is dispatched when trying to refefresh a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type FailedRefreshWriterLockEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
};

/**
 * The event is dispatched when trying to acquire a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type UnavailableWriterLockEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
};

/**
 * The event is dispatched when a lock is refreshed.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type RefreshedWriterLockEvent = {
    key: string;
    lockId: string;
    newTtl: TimeSpan;
    sharedLock: ISharedLockGetState;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export const WRITER_LOCK_EVENTS = {
    WRITER_ACQUIRED: "WRITER_ACQUIRED",
    WRITER_RELEASED: "WRITER_RELEASED",
    WRITER_FAILED_RELEASE: "WRITER_FAILED_RELEASE",
    WRITER_FAILED_REFRESH: "WRITER_FAILED_REFRESH",
    WRITER_UNAVAILABLE: "WRITER_UNAVAILABLE",
    WRITER_FORCE_RELEASED: "WRITER_FORCE_RELEASED",
    WRITER_REFRESHED: "WRITER_REFRESHED",
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type WriterLockEventMap = {
    [WRITER_LOCK_EVENTS.WRITER_ACQUIRED]: AcquiredWriterLockEvent;
    [WRITER_LOCK_EVENTS.WRITER_RELEASED]: ReleasedWriterLockEvent;
    [WRITER_LOCK_EVENTS.WRITER_FAILED_RELEASE]: FailedReleaseWriterLockEvent;
    [WRITER_LOCK_EVENTS.WRITER_FAILED_REFRESH]: FailedRefreshWriterLockEvent;
    [WRITER_LOCK_EVENTS.WRITER_UNAVAILABLE]: UnavailableWriterLockEvent;
    [WRITER_LOCK_EVENTS.WRITER_FORCE_RELEASED]: ForceReleasedWriterLockEvent;
    [WRITER_LOCK_EVENTS.WRITER_REFRESHED]: RefreshedWriterLockEvent;
};

/**
 * The event is dispatched when a lock slot is aquired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type AcquiredReaderSemaphoreEvent = {
    key: string;
    lockId: string;
    ttl: TimeSpan | null;
    sharedLock: ISharedLockGetState;
};

/**
 * The event is dispatched when a lock slot is released.
 * Note this event is only dispatched when the lock slot is released and not when the lock slot expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type ReleasedReaderSemaphoreEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
};

/**
 * The event is dispatched when all slot of semapahore are released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type AllForceReleasedReaderSemaphoreEvent = {
    key: string;
    sharedLock: ISharedLockGetState;
    hasReleased: boolean;
};

/**
 * The error is dispatched when trying to referesh a lock slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type FailedRefreshReaderSemaphoreEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
};

/**
 * The error is dispatched when trying to release a lock slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type FailedReleaseReaderSemaphoreEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
};

/**
 * The event is dispatched when trying to acquire a lock slot when all slots are unavailable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type LimitReachedReaderSemaphoreEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
};

/**
 * The event is dispatched when a lock slot is refreshed.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type RefreshedReaderSemaphoreEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
    newTtl: TimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export const READER_SEMAPHORE_EVENTS = {
    READER_ACQUIRED: "READER_ACQUIRED",
    READER_RELEASED: "READER_RELEASED",
    READER_ALL_FORCE_RELEASED: "READER_ALL_FORCE_RELEASED",
    READER_FAILED_RELEASE: "READER_FAILED_RELEASE",
    READER_FAILED_REFRESH: "READER_FAILED_REFRESH",
    READER_LIMIT_REACHED: "READER_LIMIT_REACHED",
    READER_REFRESHED: "READER_REFRESHED",
    READER_UNEXPECTED_ERROR: "READER_UNEXPECTED_ERROR",
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type ReaderSemaphoreEventMap = {
    [READER_SEMAPHORE_EVENTS.READER_ACQUIRED]: AcquiredReaderSemaphoreEvent;
    [READER_SEMAPHORE_EVENTS.READER_RELEASED]: ReleasedReaderSemaphoreEvent;
    [READER_SEMAPHORE_EVENTS.READER_ALL_FORCE_RELEASED]: AllForceReleasedReaderSemaphoreEvent;
    [READER_SEMAPHORE_EVENTS.READER_FAILED_RELEASE]: FailedReleaseReaderSemaphoreEvent;
    [READER_SEMAPHORE_EVENTS.READER_FAILED_REFRESH]: FailedRefreshReaderSemaphoreEvent;
    [READER_SEMAPHORE_EVENTS.READER_LIMIT_REACHED]: LimitReachedReaderSemaphoreEvent;
    [READER_SEMAPHORE_EVENTS.READER_REFRESHED]: RefreshedReaderSemaphoreEvent;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type UnexpectedErrorSharedLockEvent = {
    key: string;
    lockId: string;
    sharedLock: ISharedLockGetState;
    ttl: TimeSpan | null;
    error: unknown;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export const SHARED_LOCK_EVENTS = {
    ...READER_SEMAPHORE_EVENTS,
    ...WRITER_LOCK_EVENTS,
    UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Events
 */
export type SharedLockEventMap = ReaderSemaphoreEventMap &
    WriterLockEventMap & {
        [SHARED_LOCK_EVENTS.UNEXPECTED_ERROR]: UnexpectedErrorSharedLockEvent;
    };
