/**
 * @module RateLimiter
 */

import type { BackoffPolicy } from "@/backoff-policies/_module.js";
import {
    RATE_LIMITER_STATE,
    type IRateLimiterStorageAdapter,
} from "@/rate-limiter/contracts/_module.js";
import type {
    AllRateLimiterState,
    RateLimiterPolicy,
} from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-policy.js";
import { TimeSpan } from "@/time-span/implementations/time-span.js";
import { callInvokable, type InvokableFn } from "@/utilities/_module.js";

/**
 * @internal
 */
export type RateLimiterStorageSettings<TMetrics> = {
    adapter: IRateLimiterStorageAdapter<AllRateLimiterState<TMetrics>>;
    rateLimiterPolicy: RateLimiterPolicy<TMetrics>;
    backoffPolicy: BackoffPolicy;
};

/**
 * @internal
 */
export type IRateLimiterStorageState = {
    success: boolean;
    attempt: number;
    resetTime: Date | null;
};

/**
 * @internal
 */
export type AtomicUpdateArgs<TMetrics> = {
    key: string;
    update: InvokableFn<
        [currentState: AllRateLimiterState<TMetrics>],
        AllRateLimiterState<TMetrics>
    >;
};

/**
 * @internal
 */
export class RateLimiterStorage<TMetrics = unknown> {
    private readonly adapter: IRateLimiterStorageAdapter<
        AllRateLimiterState<TMetrics>
    >;
    private readonly rateLimiterPolicy: RateLimiterPolicy<TMetrics>;
    private readonly backoffPolicy: BackoffPolicy;

    constructor(settings: RateLimiterStorageSettings<TMetrics>) {
        const { adapter, rateLimiterPolicy, backoffPolicy } = settings;

        this.adapter = adapter;
        this.rateLimiterPolicy = rateLimiterPolicy;
        this.backoffPolicy = backoffPolicy;
    }

    async atomicUpdate(
        args: AtomicUpdateArgs<TMetrics>,
    ): Promise<IRateLimiterStorageState> {
        const currentDate = new Date();
        const state = await this.adapter.transaction(async (trx) => {
            const data = await this.adapter.find(args.key);
            let currentState = data?.state;
            if (currentState === undefined) {
                currentState = this.rateLimiterPolicy.initialState(currentDate);
            }

            const newState = args.update(currentState);

            await trx.upsert(
                args.key,
                newState,
                this.rateLimiterPolicy.getExpiration(newState, {
                    backoffPolicy: this.backoffPolicy,
                    currentDate,
                }),
            );

            return newState;
        });
        return this.toAdapterState(state);
    }

    private toAdapterState<TMetrics>(
        state: AllRateLimiterState<TMetrics>,
    ): IRateLimiterStorageState {
        return {
            success: state.type === RATE_LIMITER_STATE.ALLOWED,
            attempt: state.attempt,
            resetTime:
                state.type === RATE_LIMITER_STATE.ALLOWED
                    ? null
                    : TimeSpan.fromTimeSpan(
                          callInvokable(
                              this.backoffPolicy,
                              state.attempt,
                              null,
                          ),
                      ).toEndDate(new Date(state.startedAt)),
        };
    }

    async find(key: string): Promise<IRateLimiterStorageState | null> {
        const data = await this.adapter.find(key);
        if (data === null) {
            return null;
        }
        return this.toAdapterState(data.state);
    }

    async remove(key: string): Promise<void> {
        await this.adapter.remove(key);
    }
}
