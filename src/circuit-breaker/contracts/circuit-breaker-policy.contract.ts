/**
 * @module CircuitBreaker
 */

import type { CIRCUIT_BREAKER_STATE } from "@/circuit-breaker/contracts/circuit-breaker-state.contract.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type CircuitBreakerHalfOpenState<TMetrics = unknown> = {
    type: typeof CIRCUIT_BREAKER_STATE.HALF_OPEN;
    metrics: TMetrics;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type CircuitBreakerClosedState<TMetrics = unknown> = {
    type: typeof CIRCUIT_BREAKER_STATE.CLOSED;
    metrics: TMetrics;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type CircuitBreakerTrackState<TMetrics = unknown> =
    | CircuitBreakerClosedState<TMetrics>
    | CircuitBreakerHalfOpenState<TMetrics>;

/**
 * The constant represents all available state transition when in closed state
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export const CLOSED_TRANSITIONS = {
    /**
     * This field indicates that circuit breaker will transition from closed to open state.
     */
    TO_OPEN: "TO_OPEN",

    /**
     * This field indicates that circuite breaker will stay in closed state and not transition.
     */
    NONE: "NONE",
} as const;

/**
 * Indicates all available state transition when in closed state
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type ClosedTransitions =
    (typeof CLOSED_TRANSITIONS)[keyof typeof CLOSED_TRANSITIONS];

/**
 * The constant represents all available state transition when in half open state
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export const HALF_OPEN_TRANSITIONS = {
    /**
     * This field indicates that circuit breaker will transition from half open to open state.
     */
    TO_OPEN: "TO_OPEN",

    /**
     * This field indicates that circuit breaker will transition from half openb to closed state.
     */
    TO_CLOSED: "TO_CLOSED",

    /**
     * This field indicates that circuite breaker will stay in half open state and not transition.
     */
    NONE: "NONE",
} as const;

/**
 * Indicates all available state transition when in half open state
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type HalfOpenTransitions =
    (typeof HALF_OPEN_TRANSITIONS)[keyof typeof HALF_OPEN_TRANSITIONS];

/**
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type CircuitBreakerTrackSettings<TMetrics = unknown> = {
    currentDate: Date;
    initialMetrics: TMetrics;
};

/**
 * The `ICircuitBreakerPolicy` contract defines the circuite breaker algorithm.
 * Note all the methods here are pure functions, meaning they should not mutate input data and return copies.
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type ICircuitBreakerPolicy<TMetrics = unknown> = {
    initialMetrics(): TMetrics;

    /**
     * The `whenClosed` method should use `currentMetrics` and if needed `currentDate` to transition to open state or stay in closed state.
     */
    whenClosed(currentMetrics: TMetrics, currentDate: Date): ClosedTransitions;

    /**
     * The `whenHalfOpened` method should use `currentMetrics` and if needed `currentDate` to transition to open state, closed state or stay in half open state.
     */
    whenHalfOpened(
        currentMetrics: TMetrics,
        currentDate: Date,
    ): HalfOpenTransitions;

    /**
     * The `trackFailure` method updates the metrics when failure occurs. The metrics will be used `whenClosed` and `whenHalfOpen` methods.
     */
    trackFailure(
        currentState: CircuitBreakerTrackState<TMetrics>,
        settings: CircuitBreakerTrackSettings<TMetrics>,
    ): TMetrics;

    /**
     * The `trackSuccess` method updates the metrics when success occurs.
     */
    trackSuccess(
        currentState: CircuitBreakerTrackState<TMetrics>,
        settings: CircuitBreakerTrackSettings<TMetrics>,
    ): TMetrics;

    /**
     * The `isEqual` method should return true only when both metrics are equal.
     * This method is optional, it is only used for optimization purposes.
     */
    isEqual?(metricsA: TMetrics, metricsB: TMetrics): boolean;
};
