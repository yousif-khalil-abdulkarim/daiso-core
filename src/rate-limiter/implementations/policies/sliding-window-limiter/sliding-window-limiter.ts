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
export type SlidingWindowLimiterSettings = {
    /**
     * How many attempts are allowed per window.
     *
     * @default 10
     */
    maxAttempts?: number;

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
    window?: ITimeSpan;
};

/**
 * @internal
 */
export function resolveSlidingWindowLimiterSettings(
    settings: SlidingWindowLimiterSettings,
): Required<SlidingWindowLimiterSettings> {
    const { maxAttempts = 10, window = TimeSpan.fromSeconds(1) } = settings;
    if (!Number.isSafeInteger(maxAttempts)) {
        throw new TypeError(
            `"SlidingWindowLimiterSettings.maxAttempts" should be an integer, got float instead`,
        );
    }
    if (maxAttempts < 1) {
        throw new RangeError(
            `"SlidingWindowLimiterSettings.maxAttempts" should be a positive, got ${String(maxAttempts)}`,
        );
    }
    return {
        maxAttempts: maxAttempts,
        window,
    };
}

/**
 * @internal
 */
export type SerializedSlidingWindowLimiterSettings = {
    maxAttempts?: number;
    window?: number;
};

/**
 * @internal
 */
export function serializeSlidingWindowLimiterSettings(
    settings: SlidingWindowLimiterSettings,
): Required<SerializedSlidingWindowLimiterSettings> {
    const { maxAttempts: maxAttempts, window } =
        resolveSlidingWindowLimiterSettings(settings);
    return {
        maxAttempts,
        window: window[TO_MILLISECONDS](),
    };
}

/**
 * Defines the structure for tracking attempts in the rate limiter.
 * The key is the timestamp of the window's start (e.g., 1700000000000).
 * The value is the attempts for that window.
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export type SlidingWindowLimiterState = Partial<Record<number, number>>;

/**
 * Combined approach of `slidingLogs` and `fixedWindow` with lower storage
 * costs than `slidingLogs` and improved boundary behavior by calculating a
 * weighted score between two windows.
 *
 * **Pro:**
 *
 * Good performance allows this to scale to very high loads.
 *
 * **Con:**
 *
 * Nothing major.
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/policies"`
 * @group Policies
 */
export class SlidingWindowLimiter
    implements IRateLimiterPolicy<SlidingWindowLimiterState>
{
    private readonly maxAttempts: number;
    private readonly window: TimeSpan;
    private readonly margin = TimeSpan.fromSeconds(1);

    constructor(settings: SlidingWindowLimiterSettings = {}) {
        const { maxAttempts, window } =
            resolveSlidingWindowLimiterSettings(settings);
        this.maxAttempts = maxAttempts;
        this.window = TimeSpan.fromTimeSpan(window);
    }

    private currentWindow(currentDate: Date): number {
        return (
            Math.floor(currentDate.getTime() / this.window.toMilliseconds()) *
            this.window.toMilliseconds()
        );
    }

    private previousWindow(currentDate: Date): number {
        return this.currentWindow(currentDate) - this.window.toMilliseconds();
    }

    private cleanup(
        metrics: SlidingWindowLimiterState,
        currentDate: Date,
    ): SlidingWindowLimiterState {
        const previousWindow = this.previousWindow(currentDate);
        return Object.fromEntries(
            Object.entries(metrics).filter(([timeStampAsStr]) => {
                const timeStamp = Number(timeStampAsStr);

                return timeStamp >= previousWindow;
            }),
        );
    }

    private currentAttempt(
        currentMetrics: SlidingWindowLimiterState,
        currentDate: Date,
    ): number {
        return currentMetrics[this.currentWindow(currentDate)] ?? 0;
    }

    private previousAttempt(
        currentMetrics: SlidingWindowLimiterState,
        currentDate: Date,
    ): number {
        let previousAttempt =
            currentMetrics[this.previousWindow(currentDate)] ?? 0;

        const percentageInCurrentWindow =
            (currentDate.getTime() % this.window.toMilliseconds()) /
            this.window.toMilliseconds();
        previousAttempt = Math.floor(
            (1 - percentageInCurrentWindow) * previousAttempt,
        );

        return previousAttempt;
    }

    initialMetrics(currentDate: Date): SlidingWindowLimiterState {
        return {
            [this.currentWindow(currentDate)]: 0,
        };
    }

    shouldBlock(
        currentMetrics: SlidingWindowLimiterState,
        currentDate: Date,
    ): boolean {
        const currentAttempts = this.currentAttempt(
            currentMetrics,
            currentDate,
        );
        const previousAttempts = this.previousAttempt(
            currentMetrics,
            currentDate,
        );
        return currentAttempts + previousAttempts >= this.maxAttempts;
    }

    getExpiration(
        _currentMetrics: SlidingWindowLimiterState,
        currentDate: Date,
    ): Date {
        return this.window
            .multiply(2)
            .addTimeSpan(this.margin)
            .toEndDate(new Date(this.currentWindow(currentDate)));
    }

    getAttempts(
        currentMetrics: SlidingWindowLimiterState,
        currentDate: Date,
    ): number {
        const currentAttempt = this.currentAttempt(currentMetrics, currentDate);
        const previousAttempt = this.previousAttempt(
            currentMetrics,
            currentDate,
        );
        return currentAttempt + previousAttempt;
    }

    updateMetrics(
        currentMetrics: SlidingWindowLimiterState,
        currentDate: Date,
    ): SlidingWindowLimiterState {
        currentMetrics = this.cleanup(currentMetrics, currentDate);
        const currentAttempt = this.currentAttempt(currentMetrics, currentDate);
        const currentKey = this.currentWindow(currentDate);
        return {
            ...currentMetrics,
            [currentKey]: currentAttempt + 1,
        };
    }

    isEqual(
        metricsA: SlidingWindowLimiterState,
        metricsB: SlidingWindowLimiterState,
    ): boolean {
        for (const key in metricsA) {
            const valueA = metricsA[key];
            const valueB = metricsB[key];
            if (valueA !== valueB) {
                return false;
            }
        }
        return true;
    }
}
