/**
 * @module RateLimiter
 */

import type { IEventDispatcher } from "@/event-bus/contracts/_module.js";
import type { Key } from "@/namespace/_module.js";
import {
    BlockedRateLimiterError,
    RATE_LIMITER_EVENTS,
    RATE_LIMITER_STATE,
    type IRateLimiter,
    type IRateLimiterAdapter,
    type IRateLimiterAdapterState,
    type RateLimiterAllowedState,
    type RateLimiterBlockedState,
    type RateLimiterEventMap,
    type RateLimiterState,
} from "@/rate-limiter/contracts/_module.js";
import { Task } from "@/task/task.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";
import {
    callErrorPolicyOnThrow,
    resolveAsyncLazyable,
    UnexpectedError,
    type AsyncLazy,
    type ErrorPolicy,
} from "@/utilities/_module.js";

/**
 * @internal
 */
export type RateLimiterSettings = {
    enableAsyncTracking: boolean;
    eventDispatcher: IEventDispatcher<RateLimiterEventMap>;
    adapter: IRateLimiterAdapter;
    key: Key;
    errorPolicy: ErrorPolicy;
    onlyError: boolean;
};

/**
 * @internal
 */
export class RateLimiter implements IRateLimiter {
    private readonly _key: Key;
    private readonly errorPolicy: ErrorPolicy;
    private readonly onlyError: boolean;
    private readonly adapter: IRateLimiterAdapter;
    private readonly eventDispatcher: IEventDispatcher<RateLimiterEventMap>;
    private readonly enableAsyncTracking: boolean;

    constructor(settings: RateLimiterSettings) {
        const {
            enableAsyncTracking,
            eventDispatcher,
            key,
            errorPolicy,
            onlyError,
            adapter,
        } = settings;

        this.enableAsyncTracking = enableAsyncTracking;
        this.eventDispatcher = eventDispatcher;
        this._key = key;
        this.errorPolicy = errorPolicy;
        this.onlyError = onlyError;
        this.adapter = adapter;
    }

    private toRateLimiterState(
        state: IRateLimiterAdapterState | null,
    ): RateLimiterState {
        if (state === null) {
            return {
                type: RATE_LIMITER_STATE.ALLOWED,
                usedAttempts: 0,
                reaminingAttemps: this.limit,
                limit: this.limit,
            };
        }
        if (state.success) {
            return {
                type: RATE_LIMITER_STATE.ALLOWED,
                usedAttempts: state.attempt,
                reaminingAttemps: this.limit - state.attempt,
                limit: this.limit,
            } satisfies RateLimiterAllowedState;
        }

        if (state.resetTime !== null) {
            return {
                type: RATE_LIMITER_STATE.BLOCKED,
                limit: this.limit,
                totalAttempts: state.attempt,
                exceedAttempts: state.attempt - this.limit,
                resetTime: TimeSpan.fromTimeSpan(state.resetTime),
            } satisfies RateLimiterBlockedState;
        }

        throw new UnexpectedError("!!__MESSAGE__!!");
    }

    getState(): Task<RateLimiterState> {
        return new Task<RateLimiterState>(async () => {
            const state = await this.adapter.getState(this._key.toString());

            return this.toRateLimiterState(state);
        });
    }

    get key(): string {
        return this._key.get();
    }

    get limit(): number {
        return this.limit;
    }

    private async trackErrorWrapper<TValue>(
        asyncFn: AsyncLazy<TValue>,
    ): Promise<TValue> {
        const state = this.toRateLimiterState(
            await this.adapter.getState(this.key.toString()),
        );

        if (state.type === RATE_LIMITER_STATE.BLOCKED) {
            this.eventDispatcher
                .dispatch(RATE_LIMITER_EVENTS.BLOCKED, {
                    circuitBreaker: this,
                })
                .detach();

            const { type: _type, ...rest } = state;
            throw new BlockedRateLimiterError(rest, "!!__MESSAGE__!!");
        }

        try {
            this.eventDispatcher
                .dispatch(RATE_LIMITER_EVENTS.ALLOWED, {
                    circuitBreaker: this,
                })
                .detach();

            return await resolveAsyncLazyable(asyncFn);
        } catch (error: unknown) {
            const isErrorMatching = await callErrorPolicyOnThrow(
                this.errorPolicy,
                error,
            );

            if (isErrorMatching) {
                this.eventDispatcher
                    .dispatch(RATE_LIMITER_EVENTS.TRACKED_FAILURE, {
                        circuitBreaker: this,
                        error,
                    })
                    .detach();
            } else {
                this.eventDispatcher
                    .dispatch(RATE_LIMITER_EVENTS.UNTRACKED_FAILURE, {
                        circuitBreaker: this,
                        error,
                    })
                    .detach();
            }

            if (!this.enableAsyncTracking && isErrorMatching) {
                await this.adapter.updateState(this.key.toString(), this.limit);
            }

            if (this.enableAsyncTracking && isErrorMatching) {
                new Task(async () => {
                    await this.adapter.updateState(
                        this.key.toString(),
                        this.limit,
                    );
                }).detach();
            }

            throw error;
        }
    }

    private async trackWrapper<TValue>(
        asyncFn: AsyncLazy<TValue>,
    ): Promise<TValue> {
        const state = this.toRateLimiterState(
            await this.adapter.updateState(this.key.toString(), this.limit),
        );

        if (state.type === RATE_LIMITER_STATE.BLOCKED) {
            this.eventDispatcher
                .dispatch(RATE_LIMITER_EVENTS.BLOCKED, {
                    circuitBreaker: this,
                })
                .detach();

            const { type: _type, ...rest } = state;
            throw new BlockedRateLimiterError(rest, "!!__MESSAGE__!!");
        }

        this.eventDispatcher
            .dispatch(RATE_LIMITER_EVENTS.ALLOWED, {
                circuitBreaker: this,
            })
            .detach();

        return await resolveAsyncLazyable(asyncFn);
    }

    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue> {
        return new Task(async () => {
            if (this.onlyError) {
                return await this.trackErrorWrapper(asyncFn);
            }
            return await this.trackWrapper(asyncFn);
        });
    }

    reset(): Task<void> {
        return new Task(async () => {
            this.eventDispatcher
                .dispatch(RATE_LIMITER_EVENTS.RESETED, {
                    circuitBreaker: this,
                })
                .detach();
            await this.adapter.reset(this._key.toString());
        });
    }
}
