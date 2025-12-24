/**
 * @module RateLimiter
 */

import type { Task } from "@/task/task.js";
import type { ITimeSpan } from "@/time-span/contracts/_module.js";
import type { AsyncLazy } from "@/utilities/_module.js";
import type { RateLimiterState } from "@/rate-limiter/contracts/rate-limiter-state.contract.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BlockedRateLimiterError } from "@/rate-limiter/contracts/rate-limiter.errors.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export type IRateLimiterStateMethods = {
    getState(): Task<RateLimiterState>;

    /**
     * The `key` of the `IRateLimiter` instance.
     */
    readonly key: string;

    /**
     * The `limit` of the `IRateLimiter` instance.
     */
    readonly limit: number;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export type RateLimiterRunBlockingSettings = {
    time?: ITimeSpan;
    interval?: ITimeSpan;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/contracts"`
 * @group Contracts
 */
export type IRateLimiter = IRateLimiterStateMethods & {
    /**
     * @throws {BlockedRateLimiterError} {@link BlockedRateLimiterError}
     */
    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue>;

    /**
     * The `reset` method resets rate limiter to its initial state regardless of the current state.
     */
    reset(): Task<void>;
};
