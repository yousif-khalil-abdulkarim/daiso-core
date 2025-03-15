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
 * @group Events
 */
export class FailureAsyncEvent extends BaseEvent<{
    error: unknown;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class SuccessAsyncEvent<TValue> extends BaseEvent<{
    value: TValue;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class FinallyAsyncEvent extends BaseEvent<{}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class RetryAttemptAsyncEvent extends BaseEvent<{
    attempt: number;
    error: unknown;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class RetryTimeoutAsyncEvent extends BaseEvent<{
    error: TimeoutAsyncError;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class RetryFailureAsyncEvent extends BaseEvent<{
    error: RetryAsyncError;
}> {}

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/async"```
 * @group Events
 */
export class TotalTimeoutFailureAsyncEvent extends BaseEvent<{
    error: TimeoutAsyncError;
}> {}

/**
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
export type AsyncEvents<TValue> =
    | FailureAsyncEvent
    | SuccessAsyncEvent<TValue>
    | FinallyAsyncEvent
    | RetryAttemptAsyncEvent
    | RetryTimeoutAsyncEvent
    | RetryFailureAsyncEvent
    | TotalTimeoutFailureAsyncEvent
    | AbortAsyncEvent;
