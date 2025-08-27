/**
 * @module Semaphore
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export class SemaphoreError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = SemaphoreError.name;
    }
}

/**
 * The error is thrown when trying to acquire a semaphore slot, but all slots are already taken.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export class LimitReachedSemaphoreError extends SemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = LimitReachedSemaphoreError.name;
    }
}

/**
 * The error is thrown when trying to referesh a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export class FailedRefreshSemaphoreError extends SemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FailedRefreshSemaphoreError.name;
    }
}

/**
 * The error is thrown when trying to release a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export class FailedReleaseSemaphoreError extends SemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = FailedReleaseSemaphoreError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export const SEMAPHORE_ERRORS = {
    Base: SemaphoreError,
    ReachedLimit: LimitReachedSemaphoreError,
    FailedRefresh: FailedRefreshSemaphoreError,
    FailedRelease: FailedReleaseSemaphoreError,
} as const;
