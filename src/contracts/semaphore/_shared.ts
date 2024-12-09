/**
 * @module Semaphore
 */

/**
 * @group Errors
 */
export class SemaphoreError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * @group Errors
 */
export class UnexpectedSemaphoreError extends SemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}

/**
 * @group Errors
 */
export class TimeoutSemaphoreError extends SemaphoreError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}
