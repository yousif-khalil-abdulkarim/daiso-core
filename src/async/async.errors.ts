/**
 * @module Async
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export class AsyncError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = AsyncError.name;
    }
}

/**
 * This error is thrown when the is aborted.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export class AbortAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = AbortAsyncError.name;
    }
}

/**
 * This error is thrown when the has exceeded the given time limit.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export class TimeoutAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = TimeoutAsyncError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export type RetryAsyncErrorData = {
    errors: unknown[];
    maxAttempts: number;
};

/**
 * This error is thrown when the has failed all retry attempts.
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export class RetryAsyncError extends AsyncError {
    public readonly maxAttempts: number;

    public readonly errors: unknown[] = [];

    constructor(message: string, { errors, maxAttempts }: RetryAsyncErrorData) {
        super(message, errors[errors.length - 1]);
        this.errors = errors;
        this.maxAttempts = maxAttempts;
        this.name = RetryAsyncError.name;
    }
}

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Errors
 */
export const ASYNC_ERRORS = {
    Base: AsyncError,
    Abort: AbortAsyncError,
    Timeout: TimeoutAsyncError,
    Retry: RetryAsyncError,
} as const;
