/**
 * @module CircuitBreaker
 */

import {
    type ICircuitBreakerStorageAdapter,
    type CircuitBreakerStateTransition,
} from "@/circuit-breaker/contracts/_module-exports.js";
import type { CircuitBreakerPolicy } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-policy.js";
import { type AllCircuitBreakerState } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-policy.js";
import type { InvokableFn } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class CircuitBreakerStorage<TMetrics = unknown> {
    constructor(
        private readonly adapter: ICircuitBreakerStorageAdapter<
            AllCircuitBreakerState<TMetrics>
        >,
        private readonly circuitBreakerPolicy: CircuitBreakerPolicy<TMetrics>,
    ) {}

    async atomicUpdate(
        key: string,
        update: InvokableFn<
            [currentState: AllCircuitBreakerState<TMetrics>],
            AllCircuitBreakerState<TMetrics>
        >,
    ): Promise<CircuitBreakerStateTransition> {
        return await this.adapter.transaction(async (trx) => {
            const currentState =
                (await trx.find(key)) ??
                this.circuitBreakerPolicy.initialState();

            const newState = update(currentState);

            if (!this.circuitBreakerPolicy.isEqual(currentState, newState)) {
                await trx.upsert(key, newState);
            }

            return {
                from: currentState.type,
                to: newState.type,
            };
        });
    }

    async find(key: string): Promise<AllCircuitBreakerState<TMetrics>> {
        return (
            (await this.adapter.find(key)) ??
            this.circuitBreakerPolicy.initialState()
        );
    }

    async remove(key: string): Promise<void> {
        await this.adapter.remove(key);
    }
}
