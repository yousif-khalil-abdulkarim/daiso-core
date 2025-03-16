/**
 * @module Async
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Errors
 */
export class AsyncError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = AsyncError.name;
    }
}

/**
 * This error is thrown when the <i>LazyPromise</i> is aborted.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Errors
 */
export class AbortAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = AbortAsyncError.name;
    }
}

/**
 * This error is thrown when the <i>LazyPromise</i> has exceeded the given time limit.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
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
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Errors
 */
export type RetryAsyncErrorData = {
    cause?: unknown;
    maxAttempts: number;
};

/**
 * This error is thrown when the <i>LazyPromise</i> has failed all retry attempts.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Errors
 */
export class RetryAsyncError extends AsyncError {
    public readonly maxAttempts: number;

    constructor(message: string, { cause, maxAttempts }: RetryAsyncErrorData) {
        super(message, cause);
        this.name = RetryAsyncError.name;
        this.maxAttempts = maxAttempts;
    }
}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Errors
 */
export const ASYNC_ERRORS = {
    Base: AsyncError,
    Abort: AbortAsyncError,
    Timeout: TimeoutAsyncError,
    Retry: RetryAsyncError,
} as const;
