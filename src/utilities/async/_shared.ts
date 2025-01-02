/**
 * @module Utilities
 */

/**
 * @group Async
 */
export class AsyncError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = AsyncError.name;
    }
}

/**
 * @group Async
 */
export class AbortAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = AbortAsyncError.name;
    }
}

/**
 * @group Async
 */
export class TimeoutAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.name = TimeoutAsyncError.name;
    }
}

/**
 * @group Async
 */
export type RetryAsyncErrorData = {
    cause?: unknown;
    maxAttempts: number;
};

/**
 * @group Async
 */
export class RetryAsyncError extends AsyncError {
    public readonly maxAttempts: number;

    constructor(message: string, { cause, maxAttempts }: RetryAsyncErrorData) {
        super(message, cause);
        this.name = RetryAsyncError.name;
        this.maxAttempts = maxAttempts;
    }
}
