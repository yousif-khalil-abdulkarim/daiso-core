import { beforeEach, describe, expect, test, vi } from "vitest";

import {
    type CircuitBreakerTrackSettings,
    type CircuitBreakerTrackState,
    type ClosedTransitions,
    type HalfOpenTransitions,
    type ICircuitBreakerPolicy,
    type CircuitBreakerStateTransition,
    CIRCUIT_BREAKER_STATE,
} from "@/circuit-breaker/contracts/_module.js";
import { CircuitBreakerStorage } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-storage.js";
import {
    InternalCircuitBreakerPolicy,
    type HalfOpenedState,
    type OpenedState,
} from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/internal-circuit-breaker-policy.js";
import { MemoryCircuitBreakerStorageAdapter } from "@/circuit-breaker/implementations/adapters/memory-circuit-breaker-storage-adapter/_module.js";

describe("class: CircuitBreakerStorage", () => {
    let storage: CircuitBreakerStorage;
    const INITIAL_METRICS = "INITIAL_METRICS";
    const policy: ICircuitBreakerPolicy<string> = {
        initialMetrics: function (): string {
            return INITIAL_METRICS;
        },
        whenClosed: function (
            _currentMetrics: string,
            _currentDate: Date,
        ): ClosedTransitions {
            throw new Error("Function not implemented.");
        },
        whenHalfOpened: function (
            _currentMetrics: string,
            _currentDate: Date,
        ): HalfOpenTransitions {
            throw new Error("Function not implemented.");
        },
        trackFailure: function (
            _currentState: CircuitBreakerTrackState<string>,
            _settings: CircuitBreakerTrackSettings<string>,
        ): string {
            throw new Error("Function not implemented.");
        },
        trackSuccess: function (
            _currentState: CircuitBreakerTrackState<string>,
            _settings: CircuitBreakerTrackSettings<string>,
        ): string {
            throw new Error("Function not implemented.");
        },
        isEqual: function (metricsA: string, metricsB: string): boolean {
            return metricsA === metricsB;
        },
    };
    const internalPolicy = new InternalCircuitBreakerPolicy(policy);
    beforeEach(() => {
        vi.resetAllMocks();
        storage = new CircuitBreakerStorage(
            new MemoryCircuitBreakerStorageAdapter(),
            internalPolicy,
        );
    });
    describe("method: atomicUpdate", () => {
        test("Should create state for key", async () => {
            const key = "a";

            const newState: OpenedState = {
                type: CIRCUIT_BREAKER_STATE.OPEN,
                attempt: 1,
                startedAt: Date.now(),
            };
            await storage.atomicUpdate(key, (_currentState) => newState);

            const currentState = await storage.find(key);
            expect(currentState).toEqual(newState);
        });
        test("Should update state for key", async () => {
            const key = "a";

            await storage.atomicUpdate(key, (_currentState) => {
                return {
                    type: CIRCUIT_BREAKER_STATE.OPEN,
                    attempt: 1,
                    startedAt: Date.now(),
                };
            });

            const newState: HalfOpenedState = {
                type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                attempt: 1,
                metrics: INITIAL_METRICS,
            };
            await storage.atomicUpdate(key, (_currentState) => newState);

            const currentState = await storage.find(key);
            expect(currentState).toEqual(newState);
        });
        test("Should return state transition for key", async () => {
            const key = "a";

            const stateTransition = await storage.atomicUpdate(
                key,
                (_currentState) => {
                    return {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: Date.now(),
                    };
                },
            );

            expect(stateTransition).toEqual({
                from: CIRCUIT_BREAKER_STATE.CLOSED,
                to: CIRCUIT_BREAKER_STATE.OPEN,
            } satisfies CircuitBreakerStateTransition);
        });
        test("Should call InternalCircuitBreakerPolicy.initialState when key doesnt exists", async () => {
            const key = "a";

            const initialStateSpy = vi.spyOn(internalPolicy, "initialState");

            await storage.atomicUpdate(key, (_currentState) => {
                return {
                    type: CIRCUIT_BREAKER_STATE.OPEN,
                    attempt: 1,
                    startedAt: Date.now(),
                };
            });

            expect(initialStateSpy).toHaveBeenCalledOnce();
        });
        test("Should call InternalCircuitBreakerPolicy.isEqual when key doesnt exists", async () => {
            const key = "a";

            await storage.atomicUpdate(key, (_currentState) => {
                return {
                    type: CIRCUIT_BREAKER_STATE.OPEN,
                    attempt: 1,
                    startedAt: Date.now(),
                };
            });

            const isEqualSpy = vi.spyOn(internalPolicy, "isEqual");
            await storage.atomicUpdate(key, (_currentState) => {
                return {
                    type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                    attempt: 1,
                    metrics: INITIAL_METRICS,
                };
            });

            expect(isEqualSpy).toHaveBeenCalledOnce();
        });
    });
    describe("method: find", () => {
        test("Should return initial state when key doesnt exists", async () => {
            const noneExistingKey = "a";

            const state = await storage.find(noneExistingKey);

            expect(state).toEqual(internalPolicy.initialState());
        });
        test("Should call InternalCircuitBreakerPolicy.initialState when key doesnt exists", async () => {
            const noneExistingKey = "a";

            const intitialStateSpy = vi.spyOn(internalPolicy, "initialState");
            await storage.find(noneExistingKey);

            expect(intitialStateSpy).toHaveBeenCalledOnce();
        });
        test("Should return current state when key exists", async () => {
            const key = "a";

            const newState: OpenedState = {
                type: CIRCUIT_BREAKER_STATE.OPEN,
                attempt: 1,
                startedAt: Date.now(),
            };
            await storage.atomicUpdate(key, (_state) => newState);

            const state = await storage.find(key);
            expect(state).toEqual(newState);
        });
    });
    describe("method: remove", () => {
        test("Should remove key when exists", async () => {
            const key = "a";

            const newState: OpenedState = {
                type: CIRCUIT_BREAKER_STATE.OPEN,
                attempt: 1,
                startedAt: Date.now(),
            };
            await storage.atomicUpdate(key, (_currentState) => newState);

            await storage.remove(key);

            const state = await storage.find(key);
            expect(state).toEqual(internalPolicy.initialState());
        });
    });
});
