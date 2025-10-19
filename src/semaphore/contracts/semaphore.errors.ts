/**
 * @module Semaphore
 */

/**
 * The error is thrown when trying to acquire a semaphore slot, but all slots are already taken.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export class LimitReachedSemaphoreError extends Error {
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
export class FailedRefreshSemaphoreError extends Error {
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
export class FailedReleaseSemaphoreError extends Error {
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
    ReachedLimit: LimitReachedSemaphoreError,
    FailedRefresh: FailedRefreshSemaphoreError,
    FailedRelease: FailedReleaseSemaphoreError,
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export type AllSemaphoreErrors =
    | LimitReachedSemaphoreError
    | FailedRefreshSemaphoreError
    | FailedReleaseSemaphoreError;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Errors
 */
export function isSemaphoreError(value: unknown): value is AllSemaphoreErrors {
    for (const ErrorClass of Object.values(SEMAPHORE_ERRORS)) {
        if (!(value instanceof ErrorClass)) {
            return false;
        }
    }
    return true;
}
