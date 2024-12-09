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
export class UnexpectedAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedAsyncError.name;
    }
}

/**
 * @group Errors
 */
export class AbortAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = AbortAsyncError.name;
    }
}

/**
 * @group Errors
 */
export class TimeoutAsyncError extends AbortAsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TimeoutAsyncError.name;
    }
}

/**
 * @group Errors
 */
export class RetryAsyncError extends AsyncError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = RetryAsyncError.name;
    }
}
