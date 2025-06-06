/**
 * @module Async
 */

import {
    callInvokable,
    TimeSpan,
    type AsyncMiddlewareFn,
    type HookContext,
    type Invokable,
} from "@/utilities/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { CapacityFullAsyncError } from "@/async/async.errors.js";
import { PromiseQueue } from "@/async/utilities/promise-queue/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnProcessingData<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    args: TParameters;
    context: TContext;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type OnProcessing<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = Invokable<[data: OnProcessingData<TParameters, TContext>]>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type BulkheadCallbacks<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = {
    onProcessing?: OnProcessing<TParameters, TContext>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 */
export type BulkheadSettings<
    TParameters extends unknown[] = unknown[],
    TContext extends HookContext = HookContext,
> = BulkheadCallbacks<TParameters, TContext> & {
    /**
     * The maximum number of promises allowed to run concurrently. If this limit is exceeded, additional promises will be queued until a slot becomes available.
     *
     * @default {25}
     */
    maxConcurrency?: number;

    /**
     * The maximum capacity of the promise queue. If null, the queue can grow indefinitely.
     * If a number is provided and the queue exceeds this limit, an error will be thrown, and no further promises will be enqueued.
     *
     * @default {null}
     */
    maxCapacity?: number | null;

    /**
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     *
     * TimeSpan.fromMilliseconds(0)
     * ```
     */
    interval?: TimeSpan;
};

/**
 * The `bulkhead` middlewares ensures that a given amount of {@link Promiselike | `PromiseLike`} objects run at the same time concurrently and the rest will be queued up.
 * You can provide {@link BulkheadSettings | `settings.maxCapacity`}
 *
 * IMPORT_PATH: `"@daiso-tech/core/async"`
 * @group Middlewares
 * @throws {CapacityFullAsyncError} {@link CapacityFullAsyncError}
 * ```ts
 * import { bulkhead } from "@daiso-tech/core/async";
 * import { AsyncHooks } from "@daiso-tech/core/utilities";
 *
 * const fetchData = new AsyncHooks(async (url: string): Promise<unknown> => {
 *   const response = await fetch(url);
 *   const json = await response.json();
 *   return json;
 * }, [
 *   bulkhead()
 * ]);
 *
 * // Will run only 25 promises concurrently by default.
 * await Promise.all(Array(50).fill("").map(() => fetchData.invoke("URL")));
 * ```
 */
export function bulkhead<
    TParameters extends unknown[],
    TReturn,
    TContext extends HookContext,
>(
    settings: BulkheadSettings<TParameters, TContext> = {},
): AsyncMiddlewareFn<TParameters, TReturn, TContext> {
    const {
        maxConcurrency = 25,
        maxCapacity = null,
        interval = TimeSpan.fromMilliseconds(0),
        onProcessing = () => {},
    } = settings;
    const promiseQueue = new PromiseQueue({
        maxCapacity,
        maxConcurrency,
        interval,
    });
    return async (args, next, { context, signal }) => {
        return await promiseQueue.add(() => {
            callInvokable(onProcessing, {
                args,
                context,
            });
            return next(...args);
        }, signal);
    };
}
