/**
 * @module RateLimiter
 */

import type { BackoffPolicy } from "@/backoff-policies/_module-exports.js";
import {
    RATE_LIMITER_STATE,
    type IRateLimiterData,
    type IRateLimiterStorageAdapter,
} from "@/rate-limiter/contracts/_module-exports.js";
import type {
    AllRateLimiterState,
    RateLimiterPolicy,
} from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-policy.js";
import type { InvokableFn } from "@/utilities/_module-exports.js";

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
    limit: number;
    resetTime: Date | null;
};

/**
 * @internal
 */
export type AtomicUpdateArgs<TMetrics> = {
    key: string;
    limit: number;
    update: InvokableFn<
        [currentState: AllRateLimiterState<TMetrics>],
        AllRateLimiterState<TMetrics>
    >;
};

/**
 * @internal
 */
export type TestArgs<TMetrics = unknown> = {
    key: string;
    limit: number;
    find: (
        key: string,
    ) => Promise<IRateLimiterData<AllRateLimiterState<TMetrics>> | null>;
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

    private toAdapterState(
        state: AllRateLimiterState<TMetrics>,
    ): IRateLimiterStorageState {
        return {
            success: state.type === RATE_LIMITER_STATE.ALLOWED,
            attempt: state.attempt,
            limit: state.limit,
            resetTime:
                state.type === RATE_LIMITER_STATE.ALLOWED
                    ? null
                    : new Date(state.startedAt),
        };
    }

    private async get(args: TestArgs<TMetrics>) {
        const { key, limit, find } = args;
        let state: AllRateLimiterState<TMetrics> =
            this.rateLimiterPolicy.initialState(limit, new Date());
        const data = await find(key);
        const isNotNull = data !== null;
        const isUnexpireable = isNotNull && data.expiration === null;
        const isUnexpired =
            isNotNull &&
            data.expiration !== null &&
            data.expiration > new Date();
        if (isUnexpireable || isUnexpired) {
            state = data.state;
        }
        return state;
    }

    async atomicUpdate(
        args: AtomicUpdateArgs<TMetrics>,
    ): Promise<IRateLimiterStorageState> {
        const { key, limit, update } = args;
        const currentDate = new Date();
        const state = await this.adapter.transaction(async (trx) => {
            const currentState = await this.get({
                key,
                limit,
                find: (key) => {
                    return trx.find(key);
                },
            });

            const newState = update(currentState);

            if (!this.rateLimiterPolicy.isEqual(currentState, newState)) {
                await trx.upsert(
                    key,
                    newState,
                    this.rateLimiterPolicy.getExpiration(newState, {
                        backoffPolicy: this.backoffPolicy,
                        currentDate,
                    }) ?? null,
                );
            }

            return newState;
        });
        return this.toAdapterState(state);
    }

    async find(key: string, limit: number): Promise<IRateLimiterStorageState> {
        const state = await this.get({
            key,
            limit,
            find: (key) => {
                return this.adapter.find(key);
            },
        });
        return this.toAdapterState(state);
    }

    async remove(key: string): Promise<void> {
        await this.adapter.remove(key);
    }
}
