/**
 * @module RateLimiter
 */

import type { BackoffPolicy } from "@/backoff-policies/_module-exports.js";
import { RATE_LIMITER_STATE } from "@/rate-limiter/contracts/rate-limiter-state.contract.js";
import type {
    AllRateLimiterState,
    RateLimiterPolicy,
} from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-policy.js";

/**
 * @internal
 */
export class RateLimiterStateManager<TMetrics = unknown> {
    constructor(
        private readonly rateLimiterPolicy: RateLimiterPolicy<TMetrics>,
        private readonly backoffPolicy: BackoffPolicy,
    ) {}

    updateState =
        (currentDate: Date) =>
        (
            currentState: AllRateLimiterState<TMetrics>,
        ): AllRateLimiterState<TMetrics> => {
            if (currentState.type === RATE_LIMITER_STATE.ALLOWED) {
                return this.rateLimiterPolicy.whenAllowed(
                    currentState,
                    currentDate,
                );
            }
            return this.rateLimiterPolicy.whenBlocked(currentState, {
                currentDate,
                backoffPolicy: this.backoffPolicy,
            });
        };

    track =
        (currentDate: Date) =>
        (
            currentState: AllRateLimiterState<TMetrics>,
        ): AllRateLimiterState<TMetrics> => {
            if (currentState.type === RATE_LIMITER_STATE.ALLOWED) {
                return this.rateLimiterPolicy.trackWhenAllowed(
                    currentState,
                    currentDate,
                );
            }

            return this.rateLimiterPolicy.trackWhenBlocked(currentState);
        };
}
