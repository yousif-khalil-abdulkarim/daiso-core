/**
 * @module SharedLock
 */

/**
 * The error is thrown when trying to acquire a semaphore slot, but all slots are already taken.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class LimitReachedReaderSemaphoreError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = LimitReachedReaderSemaphoreError.name;
    }
}

/**
 * The error is thrown when trying to referesh a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedRefreshReaderSemaphoreError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FailedRefreshReaderSemaphoreError.name;
    }
}

/**
 * The error is thrown when trying to release a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedReleaseReaderSemaphoreError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FailedReleaseReaderSemaphoreError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export const READER_SEMAPHORE_ERRORS = {
    ReachedLimit: LimitReachedReaderSemaphoreError,
    FailedRefresh: FailedRefreshReaderSemaphoreError,
    FailedRelease: FailedReleaseReaderSemaphoreError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export type AllReaderSemaphoreErrors =
    | LimitReachedReaderSemaphoreError
    | FailedRefreshReaderSemaphoreError
    | FailedReleaseReaderSemaphoreError;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export function isReaderSemaphoreError(
    value: unknown,
): value is AllReaderSemaphoreErrors {
    for (const ErrorClass of Object.values(READER_SEMAPHORE_ERRORS)) {
        if (!(value instanceof ErrorClass)) {
            return false;
        }
    }
    return true;
}

/**
 * The error is thrown when trying to acquire a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedAcquireWriterLockError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to release a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedReleaseWriterLockError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to referesh a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export class FailedRefreshWriterLockError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export const WRITER_LOCK_ERRORS = {
    FailedAcquire: FailedAcquireWriterLockError,
    FailedRelease: FailedReleaseWriterLockError,
    FailedRefresh: FailedRefreshWriterLockError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export type AllWriterLockErrors =
    | FailedAcquireWriterLockError
    | FailedReleaseWriterLockError
    | FailedRefreshWriterLockError;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export function isWriterLockError(
    value: unknown,
): value is AllWriterLockErrors {
    for (const ErrorClass of Object.values(WRITER_LOCK_ERRORS)) {
        if (!(value instanceof ErrorClass)) {
            return false;
        }
    }
    return true;
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export const SHARED_LOCK_ERRORS = {
    ...READER_SEMAPHORE_ERRORS,
    ...WRITER_LOCK_ERRORS,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export type AllSharedLockErrors =
    | AllWriterLockErrors
    | AllReaderSemaphoreErrors;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Errors
 */
export function isSharedLockError(
    value: unknown,
): value is AllSharedLockErrors {
    return isReaderSemaphoreError(value) || isWriterLockError(value);
}
