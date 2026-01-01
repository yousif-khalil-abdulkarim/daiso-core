import {
    RATE_LIMITER_STATE,
    type IRateLimiterPolicy,
} from "@/rate-limiter/contracts/_module.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
    RateLimiterPolicy,
    type AllowedState,
    type BlockedState,
} from "@/rate-limiter/implementations/adapters/database-rate-limiter-adapter/rate-limiter-policy.js";
import { TimeSpan } from "@/time-span/implementations/time-span.js";

describe("class: RateLimiterPolicy", () => {
    const basePolicy: IRateLimiterPolicy<string> = {
        initialMetrics: function (_currentDate: Date): string {
            throw new Error("Function not implemented.");
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
            throw new Error("Function not implemented.");
        },
        getAttempts: function (
            _currentMetrics: string,
            _currentDate: Date,
        ): number {
            throw new Error("Function not implemented.");
        },
        updateMetrics: function (
            _currentMetrics: string,
            _currentDate: Date,
        ): string {
            throw new Error("Function not implemented.");
        },
    };
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("method: initialState", () => {
        test("Should return initial state", () => {
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(
                () => "INITIAL_METRICS",
            );
            vi.spyOn(basePolicy, "getAttempts").mockImplementation(() => 1);
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const currentDate = new Date("2026-01-01");
            const state = internalPolicy.initialState(currentDate);
            const metrics = basePolicy.initialMetrics(currentDate);
            const attempt = basePolicy.getAttempts(metrics, currentDate);

            expect(state).toEqual({
                type: RATE_LIMITER_STATE.ALLOWED,
                metrics,
                attempt,
            } satisfies AllowedState<string>);
        });
        test("Should call IRateLimiterPolicy.initialMetrics", () => {
            const initialMetricsSpy = vi
                .spyOn(basePolicy, "initialMetrics")
                .mockImplementation(() => "INITIAL_METRICS");
            vi.spyOn(basePolicy, "getAttempts").mockImplementation(() => 1);
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const currentDate = new Date("2026-01-01");
            internalPolicy.initialState(currentDate);

            expect(initialMetricsSpy).toHaveBeenCalledOnce();
        });
        test("Should call IRateLimiterPolicy.getAttempts", () => {
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(
                () => "INITIAL_METRICS",
            );
            const getAttemptsSpy = vi
                .spyOn(basePolicy, "getAttempts")
                .mockImplementation(() => 1);
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const currentDate = new Date("2026-01-01");
            internalPolicy.initialState(currentDate);

            expect(getAttemptsSpy).toHaveBeenCalledOnce();
        });
    });
    describe("method: whenAllowed", () => {
        test("Should return AllowedState when IRateLimiterPolicy.shouldBlock returns false", () => {
            vi.spyOn(basePolicy, "shouldBlock").mockImplementation(() => false);
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const limit = 4;
            const currentDate = new Date("2026-01-01");
            const currentMetrics: AllowedState<string> = {
                type: RATE_LIMITER_STATE.ALLOWED,
                attempt: 1,
                metrics: "METRICS",
            };
            const newState = internalPolicy.whenAllowed(
                currentMetrics,
                limit,
                currentDate,
            );

            expect(newState).toEqual(currentMetrics);
        });
        test("Should return BlockedState when IRateLimiterPolicy.shouldBlock returns true", () => {
            vi.spyOn(basePolicy, "shouldBlock").mockImplementation(() => true);
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const limit = 4;
            const currentDate = new Date("2026-01-01");
            const currentMetrics: AllowedState<string> = {
                type: RATE_LIMITER_STATE.ALLOWED,
                attempt: 1,
                metrics: "METRICS",
            };
            const newState = internalPolicy.whenAllowed(
                currentMetrics,
                limit,
                currentDate,
            );

            expect(newState).toEqual({
                type: RATE_LIMITER_STATE.BLOCKED,
                startedAt: currentDate.getTime(),
                attempt: 1,
            } satisfies BlockedState);
        });
        test("Should call IRageLimiterPolicy.shouldBlock", () => {
            const shouldBlockSpy = vi
                .spyOn(basePolicy, "shouldBlock")
                .mockImplementation(() => true);
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const limit = 4;
            const currentDate = new Date("2026-01-01");
            const currentMetrics: AllowedState<string> = {
                type: RATE_LIMITER_STATE.ALLOWED,
                attempt: 1,
                metrics: "METRICS",
            };
            internalPolicy.whenAllowed(currentMetrics, limit, currentDate);

            expect(shouldBlockSpy).toHaveBeenCalledOnce();
        });
    });
    describe("method: whenBlocked", () => {
        test("Should return BlockedState when wait time is not reached", () => {
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const waitTime = TimeSpan.fromHours(5);
            const currentDate = new Date("2026-01-01");
            const startedAt = currentDate;
            const currentMetrics: BlockedState = {
                type: RATE_LIMITER_STATE.BLOCKED,
                startedAt: currentDate.getTime(),
                attempt: 2,
            };

            const newState = internalPolicy.whenBlocked(currentMetrics, {
                currentDate,
                backoffPolicy: () => waitTime,
            });

            expect(newState).toEqual({
                type: RATE_LIMITER_STATE.BLOCKED,
                startedAt: startedAt.getTime(),
                attempt: 2,
            } satisfies BlockedState);
        });
        test("Should return AllowedState when wait time is reached", () => {
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(
                () => "INITIAL_METRICS",
            );
            vi.spyOn(basePolicy, "getAttempts").mockImplementation(() => 1);
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const waitTime = TimeSpan.fromHours(5);
            const currentDate = new Date("2026-01-01");
            const startedAt = waitTime.toStartDate(currentDate);
            const currentMetrics: BlockedState = {
                type: RATE_LIMITER_STATE.BLOCKED,
                startedAt: startedAt.getTime(),
                attempt: 2,
            };

            const newState = internalPolicy.whenBlocked(currentMetrics, {
                currentDate,
                backoffPolicy: () => waitTime,
            });

            const newMetrics = basePolicy.initialMetrics(currentDate);
            const newAttempts = basePolicy.getAttempts(newMetrics, currentDate);
            expect(newState).toEqual({
                type: RATE_LIMITER_STATE.ALLOWED,
                metrics: newMetrics,
                attempt: newAttempts,
            } satisfies AllowedState);
        });
    });
    describe("method: trackWhenAllowed", () => {
        test("Should call IRateLimiterPolicy.updateMetrics", () => {
            const NEW_METRICS = "NEW_METRICS";
            const updateMetricsSpy = vi
                .spyOn(basePolicy, "updateMetrics")
                .mockImplementation(() => NEW_METRICS);
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const currentDate = new Date("2026-01-02");
            const currentState: AllowedState<string> = {
                type: RATE_LIMITER_STATE.ALLOWED,
                attempt: 1,
                metrics: "CURRENT_METRICS",
            };
            internalPolicy.trackWhenAllowed(currentState, currentDate);

            expect(updateMetricsSpy).toHaveBeenCalledOnce();
        });
        test("Should return metrics from IRateLimiterPolicy.updateMetrics", () => {
            const NEW_METRICS = "NEW_METRICS";
            vi.spyOn(basePolicy, "updateMetrics").mockImplementation(
                () => NEW_METRICS,
            );
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const currentDate = new Date("2026-01-02");
            const currentState: AllowedState<string> = {
                type: RATE_LIMITER_STATE.ALLOWED,
                attempt: 1,
                metrics: "CURRENT_METRICS",
            };
            const newState = internalPolicy.trackWhenAllowed(
                currentState,
                currentDate,
            );

            expect(newState).toEqual({
                type: RATE_LIMITER_STATE.ALLOWED,
                metrics: NEW_METRICS,
                attempt: 1,
            } satisfies AllowedState<string>);
        });
    });
    describe("method: trackWhenBlocked", () => {
        test("Should BlockedState.attempt", () => {
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const currentDate = new Date("2026-01-02");
            const currentState: BlockedState = {
                type: RATE_LIMITER_STATE.BLOCKED,
                attempt: 1,
                startedAt: currentDate.getTime(),
            };
            const newState = internalPolicy.trackWhenBlocked(currentState);

            expect(newState).toEqual({
                type: RATE_LIMITER_STATE.BLOCKED,
                attempt: 2,
                startedAt: currentDate.getTime(),
            } satisfies BlockedState);
        });
    });
    describe("method: getExpiration", () => {
        test("Should call IRateLimiterPolicy.getExpiration", () => {
            const getExpirationSpy = vi
                .spyOn(basePolicy, "getExpiration")
                .mockImplementation(() => new Date("2026-01-02"));
            const internalPolicy = new RateLimiterPolicy(basePolicy);

            const currentDate = new Date("2026-01-02");
            const waitTime = TimeSpan.fromMinutes(5);
            const currentState: AllowedState<string> = {
                type: RATE_LIMITER_STATE.ALLOWED,
                attempt: 1,
                metrics: "CURRENT_METRICS",
            };
            internalPolicy.getExpiration(currentState, {
                currentDate,
                backoffPolicy: () => waitTime,
            });

            expect(getExpirationSpy).toHaveBeenCalledOnce();
        });
    });
});
