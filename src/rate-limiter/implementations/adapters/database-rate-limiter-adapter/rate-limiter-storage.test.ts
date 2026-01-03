import { beforeEach, describe, expect, test, vi } from "vitest";

import {
    RATE_LIMITER_STATE,
    type IRateLimiterPolicy,
} from "@/rate-limiter/contracts/_module.js";
import { RateLimiterPolicy } from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-policy.js";
import {
    RateLimiterStorage,
    type IRateLimiterStorageState,
} from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-storage.js";
import { MemoryRateLimiterStorageAdapter } from "@/rate-limiter/implementations/adapters/memory-rate-limiter-storage-adapter/_module.js";
import { TimeSpan } from "@/time-span/implementations/time-span.js";

describe("class: RateLimiterStorage", () => {
    const INITIAL_METRICS = "INITIAL_METRICS";
    const EXPIRATION = new Date("2026-01-03");
    const ATTEMPTS = 1;
    const policy: IRateLimiterPolicy<string> = {
        initialMetrics: function (_currentDate: Date): string {
            return INITIAL_METRICS;
        },
        shouldBlock: function (
            _currentMetrics: string,
            _limit: number,
            _currentDate: Date,
        ): boolean {
            throw new Error("Function not implemented.");
        },
        getExpiration: function (
            _currentMetrics: string,
            _currentDate: Date,
        ): Date {
            return EXPIRATION;
        },
        getAttempts: function (
            _currentMetrics: string,
            _currentDate: Date,
        ): number {
            return ATTEMPTS;
        },
        updateMetrics: function (
            _currentMetrics: string,
            _currentDate: Date,
        ): string {
            throw new Error("Function not implemented.");
        },
    };
    const internalPolicy = new RateLimiterPolicy(policy);
    const WAIT_TIME = TimeSpan.fromMinutes(10);
    const backoffPolicy = () => WAIT_TIME;
    let storage: RateLimiterStorage<string>;
    beforeEach(() => {
        vi.resetAllMocks();
        storage = new RateLimiterStorage({
            adapter: new MemoryRateLimiterStorageAdapter(),
            rateLimiterPolicy: internalPolicy,
            backoffPolicy,
        });
    });
    describe("method: atomicUpdate", () => {
        test("Should create state for key", async () => {
            const key = "a";

            const returnedState = await storage.atomicUpdate({
                key,
                update: (_currentState) => {
                    return {
                        type: RATE_LIMITER_STATE.ALLOWED,
                        attempt: 10,
                        metrics: "NEW_STATE",
                    };
                },
            });

            const newState: IRateLimiterStorageState = {
                success: true,
                attempt: 10,
                resetTime: null,
            };
            expect(returnedState).toEqual(newState);

            const currentState = await storage.find(key);
            expect(currentState).toEqual(newState);
        });
        test("Should update state for key", async () => {
            const key = "a";

            await storage.atomicUpdate({
                key,
                update: (_currentState) => {
                    return {
                        type: RATE_LIMITER_STATE.BLOCKED,
                        attempt: 10,
                        startedAt: new Date("2026-01-01").getTime(),
                    };
                },
            });

            await storage.atomicUpdate({
                key,
                update: (_currentState) => {
                    return {
                        type: RATE_LIMITER_STATE.ALLOWED,
                        attempt: 10,
                        metrics: "NEW_STATE",
                    };
                },
            });

            const currentState = await storage.find(key);
            expect(currentState).toEqual({
                success: true,
                attempt: 10,
                resetTime: null,
            } satisfies IRateLimiterStorageState);
        });
        test("Should call RateLimiterPolicy.initialState when key doesnt exists", async () => {
            const initialStateSpy = vi.spyOn(internalPolicy, "initialState");
            const noneExistingKey = "a";
            const currentDate = new Date("2026-01-02");

            await storage.atomicUpdate({
                key: noneExistingKey,
                update: () => {
                    return {
                        type: RATE_LIMITER_STATE.BLOCKED,
                        attempt: 1,
                        metrics: "NEW_METRICS",
                        startedAt: currentDate.getTime(),
                    };
                },
            });

            expect(initialStateSpy).toHaveBeenCalledOnce();
        });
    });
    describe("method: find", () => {
        test("Should return null when key doesnt exists", async () => {
            const noneExistingKey = "a";

            const state = await storage.find(noneExistingKey);

            expect(state).toBeNull();
        });
        test("Should return current state when key exists", async () => {
            const key = "a";
            const startedAt = new Date("2026-01-02");

            await storage.atomicUpdate({
                key,
                update: (_currentState) => {
                    return {
                        type: RATE_LIMITER_STATE.BLOCKED,
                        attempt: 1,
                        startedAt: startedAt.getTime(),
                    };
                },
            });

            const state = await storage.find(key);
            expect(state).toEqual({
                success: false,
                attempt: ATTEMPTS,
                resetTime: WAIT_TIME.toEndDate(startedAt),
            } satisfies IRateLimiterStorageState);
        });
    });
    describe("method: remove", () => {
        test("Should remove key when exists", async () => {
            const key = "a";

            await storage.atomicUpdate({
                key,
                update: (_currentState) => {
                    return {
                        type: RATE_LIMITER_STATE.BLOCKED,
                        attempt: 1,
                        startedAt: new Date("2026-01-02").getTime(),
                    };
                },
            });

            await storage.remove(key);

            const state = await storage.find(key);
            expect(state).toBeNull();
        });
    });
});
