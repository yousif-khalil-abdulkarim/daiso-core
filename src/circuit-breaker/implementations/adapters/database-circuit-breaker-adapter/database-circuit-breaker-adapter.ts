/**
 * @module CircuitBreaker
 */

import { exponentialBackoff } from "@/backoff-policies/_module-exports.js";
import type { BackoffPolicy } from "@/backoff-policies/_module-exports.js";
import {
    type ICircuitBreakerAdapter,
    type ICircuitBreakerStorageAdapter,
    type CircuitBreakerState,
    type CircuitBreakerStateTransition,
    type ICircuitBreakerPolicy,
} from "@/circuit-breaker/contracts/_module-exports.js";
import { ConsecutiveBreaker } from "@/circuit-breaker/implementations/policies/_module-exports.js";
import {
    CircuitBreakerPolicy,
    type AllCircuitBreakerState,
} from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-policy.js";
import { CircuitBreakerStateManager } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-state-manager.js";
import { CircuitBreakerStorage } from "@/circuit-breaker/implementations/adapters/database-circuit-breaker-adapter/circuit-breaker-storage.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/circiuit-breaker/database-circuit-breaker-adapter"`
 * @group Adapters
 */
export type DatabaseCirciuitBreakerAdapterSettings = {
    adapter: ICircuitBreakerStorageAdapter;

    /**
     * You can define your own {@link BackoffPolicy | `BackoffPolicy`}.
     * @default
     * ```ts
     * import { exponentialBackoff } from "@daiso-tech/core/backoff-policies";
     *
     * exponentialBackoff();
     * ```
     */
    backoffPolicy?: BackoffPolicy;

    /**
     * You can define your own {@link ICircuitBreakerPolicy | `ICircuitBreakerPolicy`}.
     * @default
     * ```ts
     * import { ConsecutiveBreaker } from "@daiso-tech/core/circiuit-breaker/circuit-breaker-policies";
     *
     * new ConsecutiveBreaker({ failureThreshold: 5 });
     * ```
     */
    circuitBreakerPolicy?: ICircuitBreakerPolicy;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/circiuit-breaker/database-circuit-breaker-adapter"`
 * @group Adapters
 */
export class DatabaseCirciuitBreakerAdapter<TMetrics = unknown>
    implements ICircuitBreakerAdapter
{
    private readonly circuitBreakerStorage: CircuitBreakerStorage<TMetrics>;
    private readonly circuitBreakerStateManager: CircuitBreakerStateManager<TMetrics>;

    /**
     * @example
     * ```ts
     * import { DatabaseCircuitBreakerAdapter } from "@daiso-tech/core/circuit-breaker/database-circuit-breaker-adapter";
     * import { MemoryCircuitBreakerStorageAdapter } from "@daiso-tech/core/circuit-breaker/memory-circuit-breaker-storage-adapter";
     *
     * const circuitBreakerStorageAdapter = new MemoryCircuitBreakerStorageAdapter();
     * const circuitBreakerAdapter = new DatabaseCircuitBreakerAdapter({
     *   adapter: circuitBreakerStorageAdapter
     * });
     * ```
     */
    constructor(settings: DatabaseCirciuitBreakerAdapterSettings) {
        const {
            adapter,
            backoffPolicy = exponentialBackoff(),
            circuitBreakerPolicy = new ConsecutiveBreaker({
                failureThreshold: 5,
            }),
        } = settings;

        const internalCircuitBreakerPolicy = new CircuitBreakerPolicy(
            circuitBreakerPolicy as ICircuitBreakerPolicy<TMetrics>,
        );
        this.circuitBreakerStorage = new CircuitBreakerStorage(
            adapter as ICircuitBreakerStorageAdapter<
                AllCircuitBreakerState<TMetrics>
            >,
            internalCircuitBreakerPolicy,
        );
        this.circuitBreakerStateManager = new CircuitBreakerStateManager(
            internalCircuitBreakerPolicy,
            backoffPolicy,
        );
    }

    async getState(key: string): Promise<CircuitBreakerState> {
        const state = await this.circuitBreakerStorage.find(key);
        return state.type;
    }

    async updateState(key: string): Promise<CircuitBreakerStateTransition> {
        return await this.circuitBreakerStorage.atomicUpdate(
            key,
            this.circuitBreakerStateManager.updateState,
        );
    }

    async trackFailure(key: string): Promise<void> {
        await this.circuitBreakerStorage.atomicUpdate(
            key,
            this.circuitBreakerStateManager.trackFailure,
        );
    }

    async trackSuccess(key: string): Promise<void> {
        await this.circuitBreakerStorage.atomicUpdate(
            key,
            this.circuitBreakerStateManager.trackSuccess,
        );
    }

    async reset(key: string): Promise<void> {
        await this.circuitBreakerStorage.remove(key);
    }

    async isolate(key: string): Promise<void> {
        await this.circuitBreakerStorage.atomicUpdate(
            key,
            this.circuitBreakerStateManager.isolate,
        );
    }
}
