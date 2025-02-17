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
