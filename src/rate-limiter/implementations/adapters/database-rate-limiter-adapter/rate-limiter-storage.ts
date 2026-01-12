/**
 * @module RateLimiter
 */

import { type BackoffPolicy } from "@/backoff-policies/_module.js";
import {
    RATE_LIMITER_STATE,
    type IRateLimiterData,
    type IRateLimiterStorageAdapter,
} from "@/rate-limiter/contracts/_module.js";
import {
    type AllRateLimiterState,
    type RateLimiterPolicy,
} from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-policy.js";
import { type InvokableFn } from "@/utilities/_module.js";

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
    resetTime: Date;
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

    private static resolveStorageData<TMetrics>(
        data: IRateLimiterData<AllRateLimiterState<TMetrics>> | null,
    ): AllRateLimiterState<TMetrics> | null {
        if (data === null) {
            return null;
        }
        if (data.expiration <= new Date()) {
            return null;
        }
        return data.state;
    }

    private toAdapterState(
        state: AllRateLimiterState<TMetrics>,
    ): IRateLimiterStorageState {
        const currentDate = new Date();
        return {
            success: state.type === RATE_LIMITER_STATE.ALLOWED,
            attempt: this.rateLimiterPolicy.getAttempts(state, currentDate),
            resetTime: this.rateLimiterPolicy.getExpiration(state, {
                backoffPolicy: this.backoffPolicy,
                currentDate,
            }),
        };
    }

    async atomicUpdate(
        args: AtomicUpdateArgs<TMetrics>,
    ): Promise<IRateLimiterStorageState> {
        const currentDate = new Date();
        const state = await this.adapter.transaction(async (trx) => {
            let currentState = RateLimiterStorage.resolveStorageData(
                await this.adapter.find(args.key),
            );
            if (currentState === null) {
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

    async find(key: string): Promise<IRateLimiterStorageState | null> {
        const state = RateLimiterStorage.resolveStorageData(
            await this.adapter.find(key),
        );
        if (state === null) {
            return null;
        }
        return this.toAdapterState(state);
    }

    async remove(key: string): Promise<void> {
        await this.adapter.remove(key);
    }
}
