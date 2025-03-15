/**
 * @module Async
 */
import type {
    AbortAsyncError,
    RetryAsyncError,
    TimeoutAsyncError,
} from "@/async/async.errors.js";
import { BaseEvent } from "@/event-bus/contracts/_shared.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class FailureLazyPromiseEvent extends BaseEvent<{
    error: unknown;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class SuccessLazyPromiseEvent<TValue> extends BaseEvent<{
    value: TValue;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class FinallyLazyPromiseEvent extends BaseEvent<{}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class RetryAttemptLazyPromiseEvent extends BaseEvent<{
    attempt: number;
    error: unknown;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class RetryTimeoutLazyPromiseEvent extends BaseEvent<{
    error: TimeoutAsyncError;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class RetryFailureLazyPromiseEvent extends BaseEvent<{
    error: RetryAsyncError;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class TotalTimeoutFailureLazyPromiseEvent extends BaseEvent<{
    error: TimeoutAsyncError;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export class AbortLazyPromiseEvent extends BaseEvent<{
    error: AbortAsyncError;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Utilities
 */
export type LazyPromiseEvents<TValue> =
    | FailureLazyPromiseEvent
    | SuccessLazyPromiseEvent<TValue>
    | FinallyLazyPromiseEvent
    | RetryAttemptLazyPromiseEvent
    | RetryTimeoutLazyPromiseEvent
    | RetryFailureLazyPromiseEvent
    | TotalTimeoutFailureLazyPromiseEvent
    | AbortLazyPromiseEvent;
