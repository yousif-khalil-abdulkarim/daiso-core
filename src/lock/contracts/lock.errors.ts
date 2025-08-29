/**
 * @module Lock
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export class LockError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to acquire a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export class FailedAcquireLockError extends LockError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to release a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export class FailedReleaseLockError extends LockError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to referesh a lock that is owned by a different owner.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export class FailedRefreshLockError extends LockError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export const LOCK_ERRORS = {
    Base: LockError,
    FailedAcquire: FailedAcquireLockError,
    FailedRelease: FailedReleaseLockError,
    FailedRefresh: FailedRefreshLockError,
} as const;
