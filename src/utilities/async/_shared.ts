/**
 * @module Async
 */

/**
 * @group Errors
 */
export class AsyncError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = AsyncError.name;
    }
}

/**
 * @group Errors
 */
export class AbortAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = AbortAsyncError.name;
    }
}

/**
 * @group Errors
 */
export class TimeoutAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = TimeoutAsyncError.name;
    }
}

/**
 * @group Errors
 */
export type RetryAsyncErrorData = {
    cause?: unknown;
    maxAttempts: number;
};

/**
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
