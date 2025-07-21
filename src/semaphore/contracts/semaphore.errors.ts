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
    }
}

/**
 * The error is thrown when trying to acquire a semaphore slot, but all slots are already taken.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export class ReachedLimitSemaphoreError extends SemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * The error is thrown when trying to referesh a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export class ExpiredRefreshSemaphoreError extends SemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export const SEMAPHORE_ERRORS = {
    Base: SemaphoreError,
    ReachedLimit: ReachedLimitSemaphoreError,
    ExpiredRefresh: ExpiredRefreshSemaphoreError,
} as const;
