/**
 * @module RateLimiter
 */

import type { IRateLimiterPolicy } from "@/rate-limiter/contracts/rate-limiter-policy.contract.js";
import {
    TO_MILLISECONDS,
    type ITimeSpan,
} from "@/time-span/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export type FixedWindowLimiterSettings = {
    /**
     * How many attempts are allowed per window.
     *
     * @default 10
     */
    attempts?: number;

    /**
     * The time span in which `maxAttempts` are allowed.
     *
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span";
     *
     * TimeSpan.fromSeconds(1)
     * ```
     */
    timeSpan?: ITimeSpan;
};

/**
 * @internal
 */
export function resolveFixedWindowLimiterSettings(
    settings: FixedWindowLimiterSettings,
): Required<FixedWindowLimiterSettings> {
    const { attempts: maxAttempts = 10, timeSpan = TimeSpan.fromSeconds(1) } =
        settings;
    if (!Number.isSafeInteger(maxAttempts)) {
        throw new TypeError(
            `"FixedWindowLimiterSettings.maxAttempts" should be an integer, got float instead`,
        );
    }
    if (maxAttempts < 1) {
        throw new RangeError(
            `"FixedWindowLimiterSettings.maxAttempts" should be a positive, got ${String(maxAttempts)}`,
        );
    }
    return {
        attempts: maxAttempts,
        timeSpan,
    };
}

/**
 * @internal
 */
export type SerializedFixedWindowLimiterSettings = {
    maxAttempts?: number;
    timeSpan?: number;
};

/**
 * @internal
 */
export function serializeFixedWindowLimiterSettings(
    settings: FixedWindowLimiterSettings,
): Required<SerializedFixedWindowLimiterSettings> {
    const { attempts: maxAttempts, timeSpan } =
        resolveFixedWindowLimiterSettings(settings);
    return {
        maxAttempts,
        timeSpan: timeSpan[TO_MILLISECONDS](),
    };
}

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export type FixedWindowLimiterState = {
    attempt: number;
};

/**
 * Each request inside a fixed time increases a counter.
 * Once the counter reaches the maximum allowed number, all further attempts are
 * rejected.
 *
 * **Pro:**
 *
 * - Newer attempts are not starved by old ones.
 * - Low storage cost.
 *
 * **Con:**
 *
 * A burst of attempts near the boundary of a window can result in a very
 * high request rate because two windows will be filled with attempts quickly.
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export class FixedWindowLimiter
    implements IRateLimiterPolicy<FixedWindowLimiterState>
{
    constructor(settings: FixedWindowLimiterSettings = {}) {}

    initialMetrics(): FixedWindowLimiterState {
        throw new Error("Method not implemented.");
    }

    shouldBlock(
        currentMetrics: FixedWindowLimiterState,
        currentDate: Date,
    ): boolean {
        throw new Error("Method not implemented.");
    }

    getExpiration?(currentMetrics: FixedWindowLimiterState): TimeSpan {
        throw new Error("Method not implemented.");
    }

    getAttempts(currentMetrics: FixedWindowLimiterState): number {
        return currentMetrics.attempt;
    }

    updateMetrics(
        currentMetrics: FixedWindowLimiterState,
        currentDate: Date,
    ): FixedWindowLimiterState {
        throw new Error("Method not implemented.");
    }

    isEqual?(
        metricsA: FixedWindowLimiterState,
        metricsB: FixedWindowLimiterState,
    ): boolean {
        throw new Error("Method not implemented.");
    }
}
