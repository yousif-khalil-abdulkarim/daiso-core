/**
 * @module Lock
 */

/**
 * The error is thrown when trying to acquire a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export class FailedAcquireLockError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FailedAcquireLockError.name;
    }
}

/**
 * The error is thrown when trying to release a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export class FailedReleaseLockError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FailedReleaseLockError.name;
    }
}

/**
 * The error is thrown when trying to referesh a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export class FailedRefreshLockError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FailedRefreshLockError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export const LOCK_ERRORS = {
    FailedAcquire: FailedAcquireLockError,
    FailedRelease: FailedReleaseLockError,
    FailedRefresh: FailedRefreshLockError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export type AllLockErrors =
    | FailedAcquireLockError
    | FailedReleaseLockError
    | FailedRefreshLockError;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export function isLockError(value: unknown): value is AllLockErrors {
    for (const ErrorClass of Object.values(LOCK_ERRORS)) {
        if (!(value instanceof ErrorClass)) {
            return false;
        }
    }
    return true;
}
