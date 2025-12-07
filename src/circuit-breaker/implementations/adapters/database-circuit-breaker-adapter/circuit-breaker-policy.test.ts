import { beforeEach, describe, expect, test, vi } from "vitest";
import {
    CircuitBreakerPolicy,
    type ClosedState,
    type HalfOpenedState,
    type OpenedState,
} from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-policy.js";
import {
    CLOSED_TRANSITIONS,
    HALF_OPEN_TRANSITIONS,
    type CircuitBreakerTrackSettings,
    type CircuitBreakerTrackState,
    type ClosedTransitions,
    type HalfOpenTransitions,
    type ICircuitBreakerPolicy,
} from "@/circuit-breaker/contracts/circuit-breaker-policy.contract.js";
import { CIRCUIT_BREAKER_STATE } from "@/circuit-breaker/contracts/circuit-breaker-state.contract.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

describe("class: CircuitBreakerPolicy", () => {
    const basePolicy: Required<ICircuitBreakerPolicy<string>> = {
        initialMetrics: function (): string {
            throw new Error("Function not implemented.");
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
        isEqual: function (_metricsA: string, _metricsB: string): boolean {
            throw new Error("Function not implemented.");
        },
    };
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("method: isEqual", () => {
        describe("when ICircuitBreakerPolicy.isEqual is not defined", () => {
            let internalPolicy: CircuitBreakerPolicy<string>;
            beforeEach(() => {
                const { isEqual: _isEqual, ...rest } = basePolicy;
                const policy: Omit<
                    ICircuitBreakerPolicy<string>,
                    "isEqual"
                > = rest;
                internalPolicy = new CircuitBreakerPolicy(policy);
            });

            test("Should return false when stateA is ClosedState and stateB is OpenState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: Date.now(),
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is ClosedState and stateB is HalfOpenState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "A",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is ClosedState and stateB is IsolatedState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.ISOLATED,
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is OpenState and stateB is HalfOpenState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: Date.now(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "A",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is OpenState and stateB is IsolatedState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: Date.now(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.ISOLATED,
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is HalfOpenState and stateB is IsolatedState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.ISOLATED,
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when both states are ClosedState and metrics is same", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when both states are ClosedState and metrics is different", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "B",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return true when both states are OpenState, attempt and startedAt are same", () => {
                const currentDate = new Date();
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: currentDate.getTime(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: currentDate.getTime(),
                    },
                );

                expect(result).toBe(true);
            });
            test("Should return false when both states are OpenState, only startedAt is different", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: new Date("2020").getTime(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: new Date("2025").getTime(),
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when both states are OpenState, only attempt is different", () => {
                const currentDate = new Date();
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: currentDate.getTime(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 2,
                        startedAt: currentDate.getTime(),
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when both states are HalfOpenState, attempt and metrics are same", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "a",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "a",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when both states are HalfOpenState, only attempt is different", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "a",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 2,
                        metrics: "a",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when both states are HalfOpenState, only metrics is different", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "a",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "b",
                    },
                );

                expect(result).toBe(false);
            });
        });
        describe("when ICircuitBreakerPolicy.isEqual is defined", () => {
            let internalPolicy: CircuitBreakerPolicy<string>;
            let policy: Required<ICircuitBreakerPolicy<string>>;
            beforeEach(() => {
                policy = {
                    ...basePolicy,
                    isEqual(metricsA: string, metricsB: string): boolean {
                        return metricsA === metricsB;
                    },
                };
                internalPolicy = new CircuitBreakerPolicy(policy);
            });

            test("Should return false when stateA is ClosedState and stateB is OpenState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: Date.now(),
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is ClosedState and stateB is HalfOpenState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "A",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is ClosedState and stateB is IsolatedState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.ISOLATED,
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is OpenState and stateB is HalfOpenState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: Date.now(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "A",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is OpenState and stateB is IsolatedState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: Date.now(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.ISOLATED,
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when stateA is HalfOpenState and stateB is IsolatedState", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.ISOLATED,
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return true when both states are ClosedState and metrics are same", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                );

                expect(result).toBe(true);
            });
            test("Should return false when both states are ClosedState and metrics are different", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "A",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.CLOSED,
                        metrics: "B",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return true when both states are OpenState, attempt and startedAt are same", () => {
                const currentDate = new Date();
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: currentDate.getTime(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: currentDate.getTime(),
                    },
                );

                expect(result).toBe(true);
            });
            test("Should return false when both states are OpenState, only attempt is same", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: new Date("2020").getTime(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: new Date("2025").getTime(),
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when both states are OpenState, only startAt is same", () => {
                const currentDate = new Date();
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 1,
                        startedAt: currentDate.getTime(),
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.OPEN,
                        attempt: 2,
                        startedAt: currentDate.getTime(),
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return true when both states are HalfOpenState, attempt and metrics are same", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "a",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "a",
                    },
                );

                expect(result).toBe(true);
            });
            test("Should return false when both states are HalfOpenState, only attempt is different", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "a",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 2,
                        metrics: "a",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should return false when both states are HalfOpenState, only metrics is different", () => {
                const result = internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "a",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "b",
                    },
                );

                expect(result).toBe(false);
            });
            test("Should call ICircuitBreakerPolicy.isEqual", () => {
                const isEqualSpy = vi.spyOn(policy, "isEqual");

                internalPolicy.isEqual(
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "a",
                    },
                    {
                        type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                        attempt: 1,
                        metrics: "b",
                    },
                );

                expect(isEqualSpy).toHaveBeenCalledOnce();
            });
        });
    });
    describe("method: initialState", () => {
        test("Should return initial state", () => {
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(
                () => "INITIAL_METRICS",
            );
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            const state = internalPolicy.initialState();

            expect(state).toEqual({
                type: CIRCUIT_BREAKER_STATE.CLOSED,
                metrics: basePolicy.initialMetrics(),
            } satisfies ClosedState<string>);
        });
        test("Should call ICircuitBreakerPolicy.initialMetrics", () => {
            const initialMetricsSpy = vi
                .spyOn(basePolicy, "initialMetrics")
                .mockImplementation(() => "INITIAL_METRICS");
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            internalPolicy.initialState();

            expect(initialMetricsSpy).toHaveBeenCalledOnce();
        });
    });
    describe("method: whenClosed", () => {
        test("Should return ClosedState when CLOSED_TRANSITIONS.NONE is returned", () => {
            vi.spyOn(basePolicy, "whenClosed").mockImplementation(
                () => CLOSED_TRANSITIONS.NONE,
            );
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);
            const currentState: ClosedState<string> = {
                type: CIRCUIT_BREAKER_STATE.CLOSED,
                metrics: "metrics",
            };

            const newState = internalPolicy.whenClosed(
                currentState,
                new Date(),
            );

            expect(newState).toEqual(currentState);
        });
        test("Should return OpenedState when CLOSED_TRANSITIONS.TO_OPEN is returned", () => {
            vi.spyOn(basePolicy, "whenClosed").mockImplementation(
                () => CLOSED_TRANSITIONS.TO_OPEN,
            );
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);
            const currentState: ClosedState<string> = {
                type: CIRCUIT_BREAKER_STATE.CLOSED,
                metrics: "metrics",
            };
            const currentDate = new Date();

            const newState = internalPolicy.whenClosed(
                currentState,
                currentDate,
            );

            expect(newState).toEqual({
                type: CIRCUIT_BREAKER_STATE.OPEN,
                attempt: 1,
                startedAt: currentDate.getTime(),
            } satisfies OpenedState);
        });
        test("Should call ICircuitBreakerPolicy.whenClosed", () => {
            const whenClosedSpy = vi
                .spyOn(basePolicy, "whenClosed")
                .mockImplementation(() => CLOSED_TRANSITIONS.NONE);
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);
            const currentMetrics = "metrics";
            const currentState: ClosedState<string> = {
                type: CIRCUIT_BREAKER_STATE.CLOSED,
                metrics: currentMetrics,
            };

            const currentDate = new Date();
            internalPolicy.whenClosed(currentState, currentDate);

            expect(whenClosedSpy).toHaveBeenCalledExactlyOnceWith(
                currentMetrics,
                currentDate,
            );
        });
    });
    describe("method: whenOpened", () => {
        test("Should return OpenedState when wait time is not over", () => {
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);
            const waitTime = TimeSpan.fromMilliseconds(50);
            const currentDate = new Date();

            const currentState: OpenedState = {
                type: CIRCUIT_BREAKER_STATE.OPEN,
                attempt: 1,
                startedAt: currentDate.getTime(),
            };

            const newState = internalPolicy.whenOpened(currentState, {
                backoffPolicy: () => waitTime,
                currentDate: waitTime.divide(2).toEndDate(new Date()),
            });

            expect(newState).toEqual(currentState);
        });
        test("Should return HalfOpenedState when wait time is over", () => {
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(
                () => "INITIAL_METRICS",
            );
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);
            const waitTime = TimeSpan.fromMilliseconds(50);
            const currentDate = new Date();
            const currentState: OpenedState = {
                type: CIRCUIT_BREAKER_STATE.OPEN,
                attempt: 1,
                startedAt: currentDate.getTime(),
            };

            const newState = internalPolicy.whenOpened(currentState, {
                backoffPolicy: () => waitTime,
                currentDate: waitTime.multiply(2).toEndDate(currentDate),
            });

            expect(newState).toEqual({
                type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                attempt: 1,
                metrics: basePolicy.initialMetrics(),
            } satisfies HalfOpenedState<string>);
        });
    });
    describe("method: whenHalfOpened", () => {
        test("Should return HalfOpenState when HALF_OPEN_TRANSITIONS.NONE is returned", () => {
            vi.spyOn(basePolicy, "whenHalfOpened").mockImplementation(
                () => HALF_OPEN_TRANSITIONS.NONE,
            );
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);
            const currentState: HalfOpenedState<string> = {
                type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                attempt: 1,
                metrics: "metrics",
            };

            const newState = internalPolicy.whenHalfOpened(
                currentState,
                new Date(),
            );

            expect(newState).toEqual(currentState);
        });
        test("Should return OpenedState when HALF_OPEN_TRANSITIONS.TO_OPEN is returned", () => {
            vi.spyOn(basePolicy, "whenHalfOpened").mockImplementation(
                () => HALF_OPEN_TRANSITIONS.TO_OPEN,
            );
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);
            const currentState: HalfOpenedState<string> = {
                type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                attempt: 1,
                metrics: "metrics",
            };

            const currentDate = new Date();
            const newState = internalPolicy.whenHalfOpened(
                currentState,
                currentDate,
            );

            expect(newState).toEqual({
                type: CIRCUIT_BREAKER_STATE.OPEN,
                attempt: 2,
                startedAt: currentDate.getTime(),
            } satisfies OpenedState);
        });
        test("Should return ClosedState when HALF_OPEN_TRANSITIONS.TO_CLOSED is returned", () => {
            vi.spyOn(basePolicy, "whenHalfOpened").mockImplementation(
                () => HALF_OPEN_TRANSITIONS.TO_CLOSED,
            );
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(
                () => "INITIAL_METRICS",
            );
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);
            const currentState: HalfOpenedState<string> = {
                type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                attempt: 1,
                metrics: "metrics",
            };

            const currentDate = new Date();
            const newState = internalPolicy.whenHalfOpened(
                currentState,
                currentDate,
            );

            expect(newState).toEqual({
                type: CIRCUIT_BREAKER_STATE.CLOSED,
                metrics: basePolicy.initialMetrics(),
            } satisfies ClosedState<string>);
        });
        test("Should call ICircuitBreakerPolicy.whenHalfOpened", () => {
            const whenHalfOpened = vi
                .spyOn(basePolicy, "whenHalfOpened")
                .mockImplementation(() => HALF_OPEN_TRANSITIONS.NONE);
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);
            const currentMetrics = "metrics";
            const currentState: HalfOpenedState<string> = {
                type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                attempt: 1,
                metrics: currentMetrics,
            };

            const currentDate = new Date();
            internalPolicy.whenHalfOpened(currentState, currentDate);

            expect(whenHalfOpened).toHaveBeenCalledExactlyOnceWith(
                currentMetrics,
                currentDate,
            );
        });
    });
    describe("method: trackSuccessWhenClosed", () => {
        test("Should call ICircuitBreakerPolicy.trackSuccess", () => {
            const trackSuccessSpy = vi
                .spyOn(basePolicy, "trackSuccess")
                .mockImplementation(() => "NEW");
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(() => {
                return "INITIAL";
            });
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            internalPolicy.trackSuccessWhenClosed(
                {
                    type: CIRCUIT_BREAKER_STATE.CLOSED,
                    metrics: "CURRENT_METRICS",
                },
                new Date(),
            );

            expect(trackSuccessSpy).toHaveBeenCalledOnce();
        });
        test("Should return metrics from ICircuitBreakerPolicy.trackSuccess", () => {
            const NEW_METRICS = "NEW";
            vi.spyOn(basePolicy, "trackSuccess").mockImplementation(
                () => NEW_METRICS,
            );
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(() => {
                return "INITIAL";
            });
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            const currentState: ClosedState<string> = {
                type: CIRCUIT_BREAKER_STATE.CLOSED,
                metrics: "CURRENT_METRICS",
            };
            const newMetrics = internalPolicy.trackSuccessWhenClosed(
                currentState,
                new Date(),
            );

            expect(newMetrics).toEqual({
                ...currentState,
                metrics: NEW_METRICS,
            } satisfies ClosedState<string>);
        });
    });
    describe("method: trackFailureWhenClosed", () => {
        test("Should call ICircuitBreakerPolicy.trackFailure", () => {
            const trackFailureSpy = vi
                .spyOn(basePolicy, "trackFailure")
                .mockImplementation(() => "NEW");
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(() => {
                return "INITIAL";
            });
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            internalPolicy.trackFailureWhenClosed(
                {
                    type: CIRCUIT_BREAKER_STATE.CLOSED,
                    metrics: "CURRENT_METRICS",
                },
                new Date(),
            );

            expect(trackFailureSpy).toHaveBeenCalledOnce();
        });
        test("Should return metrics from ICircuitBreakerPolicy.trackSuccess", () => {
            const NEW_METRICS = "NEW";
            vi.spyOn(basePolicy, "trackFailure").mockImplementation(
                () => NEW_METRICS,
            );
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(() => {
                return "INITIAL";
            });
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            const currentState: ClosedState<string> = {
                type: CIRCUIT_BREAKER_STATE.CLOSED,
                metrics: "CURRENT_METRICS",
            };
            const newState = internalPolicy.trackFailureWhenClosed(
                currentState,
                new Date(),
            );

            expect(newState).toEqual({
                ...currentState,
                metrics: NEW_METRICS,
            } satisfies ClosedState<string>);
        });
    });
    describe("method: trackSuccessWhenHalfOpened", () => {
        test("Should call ICircuitBreakerPolicy.trackSuccess", () => {
            const trackSuccessSpy = vi
                .spyOn(basePolicy, "trackSuccess")
                .mockImplementation(() => "NEW");
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(() => {
                return "INITIAL";
            });
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            internalPolicy.trackSuccessWhenHalfOpened(
                {
                    type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                    attempt: 1,
                    metrics: "CURRENT_METRICS",
                },
                new Date(),
            );

            expect(trackSuccessSpy).toHaveBeenCalledOnce();
        });
        test("Should return metrics from ICircuitBreakerPolicy.trackSuccess", () => {
            const NEW_METRICS = "NEW";
            vi.spyOn(basePolicy, "trackSuccess").mockImplementation(
                () => NEW_METRICS,
            );
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(() => {
                return "INITIAL";
            });
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            const currentState: HalfOpenedState<string> = {
                type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                attempt: 1,
                metrics: "CURRENT_METRICS",
            };
            const newState = internalPolicy.trackSuccessWhenHalfOpened(
                currentState,
                new Date(),
            );

            expect(newState).toEqual({
                ...currentState,
                metrics: NEW_METRICS,
            } satisfies HalfOpenedState<string>);
        });
    });
    describe("method: trackFailureWhenHalfOpened", () => {
        test("Should call ICircuitBreakerPolicy.trackFailure", () => {
            const trackFailureSpy = vi
                .spyOn(basePolicy, "trackFailure")
                .mockImplementation(() => "NEW");
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(() => {
                return "INITIAL";
            });
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            internalPolicy.trackFailureWhenHalfOpened(
                {
                    type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                    attempt: 1,
                    metrics: "CURRENT_METRICS",
                },
                new Date(),
            );

            expect(trackFailureSpy).toHaveBeenCalledOnce();
        });
        test("Should return metrics from ICircuitBreakerPolicy.trackSuccess", () => {
            const NEW_METRICS = "NEW";
            vi.spyOn(basePolicy, "trackFailure").mockImplementation(
                () => NEW_METRICS,
            );
            vi.spyOn(basePolicy, "initialMetrics").mockImplementation(() => {
                return "INITIAL";
            });
            const internalPolicy = new CircuitBreakerPolicy(basePolicy);

            const currentState: HalfOpenedState<string> = {
                type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                attempt: 1,
                metrics: "CURRENT_METRICS",
            };
            const newState = internalPolicy.trackFailureWhenHalfOpened(
                {
                    type: CIRCUIT_BREAKER_STATE.HALF_OPEN,
                    attempt: 1,
                    metrics: "CURRENT_METRICS",
                },
                new Date(),
            );

            expect(newState).toEqual({
                ...currentState,
                metrics: NEW_METRICS,
            } satisfies HalfOpenedState<string>);
        });
    });
});
