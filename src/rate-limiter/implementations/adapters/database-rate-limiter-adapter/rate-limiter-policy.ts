/**
 * @module RateLimiter
 */

import type { BackoffPolicy } from "@/backoff-policies/_module.js";
import type { IRateLimiterPolicy } from "@/rate-limiter/contracts/_module.js";
import { RATE_LIMITER_STATE } from "@/rate-limiter/contracts/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";
import { callInvokable } from "@/utilities/_module.js";

/**
 * @internal
 */
export type AllowedRateLimiterState<TMetrics = unknown> = {
    type: (typeof RATE_LIMITER_STATE)["ALLOWED"];
    metrics: TMetrics;
    attempt: number;
};

/**
 * @internal
 */
export type BlockedRateLimiterState = {
    type: (typeof RATE_LIMITER_STATE)["BLOCKED"];
    /**
     * Unix timestamp in miliseconds
     */
    startedAt: number;
    attempt: number;
};

/**
 * @internal
 */
export type AllRateLimiterState<TMetrics = unknown> =
    | AllowedRateLimiterState<TMetrics>
    | BlockedRateLimiterState;

/**
 * @internal
 */
export type BackoffPolicySettings = {
    currentDate: Date;
    backoffPolicy: BackoffPolicy;
};

/**
 * @internal
 */
export class RateLimiterPolicy<TMetrics = unknown> {
    constructor(
        private readonly rateLimiterPolicy: IRateLimiterPolicy<TMetrics>,
    ) {}

    initialState(currentDate: Date): AllowedRateLimiterState<TMetrics> {
        const currentMetrics =
            this.rateLimiterPolicy.initialMetrics(currentDate);
        return {
            attempt: this.rateLimiterPolicy.getAttempts(
                currentMetrics,
                currentDate,
            ),
            type: RATE_LIMITER_STATE.ALLOWED,
            metrics: currentMetrics,
        };
    }

    whenAllowed(
        currentState: AllowedRateLimiterState<TMetrics>,
        limit: number,
        currentDate: Date,
    ): AllRateLimiterState<TMetrics> {
        if (
            this.rateLimiterPolicy.shouldBlock(
                currentState.metrics,
                limit,
                currentDate,
            )
        ) {
            return {
                type: RATE_LIMITER_STATE.BLOCKED,
                attempt: 1,
                startedAt: currentDate.getTime(),
            };
        }

        return currentState;
    }

    whenBlocked(
        currentState: BlockedRateLimiterState,
        settings: BackoffPolicySettings,
    ): AllRateLimiterState<TMetrics> {
        const waitTime = TimeSpan.fromTimeSpan(
            callInvokable(settings.backoffPolicy, currentState.attempt, null),
        );
        const endDate = waitTime.toEndDate(new Date(currentState.startedAt));
        const isWaitTimeOver = endDate <= new Date(settings.currentDate);

        if (isWaitTimeOver) {
            const currentMetrics = this.rateLimiterPolicy.initialMetrics(
                settings.currentDate,
            );
            return {
                attempt: this.rateLimiterPolicy.getAttempts(
                    currentMetrics,
                    settings.currentDate,
                ),
                type: RATE_LIMITER_STATE.ALLOWED,
                metrics: currentMetrics,
            };
        }
        return currentState;
    }

    trackWhenAllowed(
        currentState: AllowedRateLimiterState<TMetrics>,
        currentDate: Date,
    ): AllRateLimiterState<TMetrics> {
        return {
            type: currentState.type,
            attempt: currentState.attempt,
            metrics: this.rateLimiterPolicy.updateMetrics(
                currentState.metrics,
                currentDate,
            ),
        };
    }

    trackWhenBlocked(
        currentState: BlockedRateLimiterState,
    ): BlockedRateLimiterState {
        return {
            type: currentState.type,
            startedAt: currentState.startedAt,
            attempt: currentState.attempt + 1,
        };
    }

    getExpiration(
        currentState: AllRateLimiterState<TMetrics>,
        settings: BackoffPolicySettings,
    ): Date {
        if (currentState.type === RATE_LIMITER_STATE.ALLOWED) {
            return this.rateLimiterPolicy.getExpiration(
                currentState.metrics,
                settings.currentDate,
            );
        }

        return TimeSpan.fromTimeSpan(
            callInvokable(settings.backoffPolicy, currentState.attempt, null),
        ).toEndDate(settings.currentDate);
    }
}
