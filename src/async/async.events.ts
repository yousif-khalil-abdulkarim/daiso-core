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
 * This event is dispatched when the <i>LazyPromise</i> has been rejected.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class FailureAsyncEvent extends BaseEvent<{
    error: unknown;
}> {}

/**
 * This event is dispatched when the <i>LazyPromise</i> has been fulfilled.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class SuccessAsyncEvent<TValue> extends BaseEvent<{
    value: TValue;
}> {}

/**
 * This event is dispatched when the <i>LazyPromise</i> has been fulfilled or rejected.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class FinallyAsyncEvent extends BaseEvent<{}> {}

/**
 * This event is dispatched on every retry attempt of the <i>LazyPromise</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class RetryAttemptAsyncEvent extends BaseEvent<{
    attempt: number;
    error: unknown;
}> {}

/**
 * This event is dispatched when the rety attempt of the <i>LazyPromise</i> has exceeded the given time limit.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class RetryTimeoutAsyncEvent extends BaseEvent<{
    error: TimeoutAsyncError;
}> {}

/**
 * This event is dispatched when the <i>LazyPromise</i> has failed all retry attempts.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class RetryFailureAsyncEvent extends BaseEvent<{
    error: RetryAsyncError;
}> {}

/**
 * This event is dispatched when <i>LazyPromise</i> has exceeded the given total time limit.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class TotalTimeoutFailureAsyncEvent extends BaseEvent<{
    error: TimeoutAsyncError;
}> {}

/**
 * This event is dispatched when <i>LazyPromise</i> is aborted.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class AbortAsyncEvent extends BaseEvent<{
    error: AbortAsyncError;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export const ASYNC_EVENTS = {
    Failure: FailureAsyncEvent,
    Success: SuccessAsyncEvent,
    Finally: FinallyAsyncEvent,
    RetryAttempt: RetryAttemptAsyncEvent,
    RetryTimeout: RetryTimeoutAsyncEvent,
    RetryFailure: RetryFailureAsyncEvent,
    TotalTimeoutFailure: TotalTimeoutFailureAsyncEvent,
    Abort: AbortAsyncEvent,
} as const;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export type AsyncEvents<TValue> =
    | FailureAsyncEvent
    | SuccessAsyncEvent<TValue>
    | FinallyAsyncEvent
    | RetryAttemptAsyncEvent
    | RetryTimeoutAsyncEvent
    | RetryFailureAsyncEvent
    | TotalTimeoutFailureAsyncEvent
    | AbortAsyncEvent;
