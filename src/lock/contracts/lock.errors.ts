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
export class KeyAlreadyAcquiredLockError extends LockError {
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
export class UnownedReleaseLockError extends LockError {
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
export class UnownedRefreshLockError extends LockError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to referesh a lock that is unexpireable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Errors
 */
export class UnrefreshableKeyLockError extends LockError {
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
    UnrefreshableKey: UnrefreshableKeyLockError,
    KeyAlreadyAcquired: KeyAlreadyAcquiredLockError,
    UnownedRelease: UnownedReleaseLockError,
    UnownedRefresh: UnownedRefreshLockError,
} as const;
