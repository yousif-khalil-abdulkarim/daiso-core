/**
 * @module CircuitBreaker
 */

import type {
    ICircuitBreakerStorageAdapter,
    ICircuitBreakerStorageAdapterTransaction,
} from "@/circuit-breaker/contracts/circuit-breaker-storage-adapter.contract.js";
import type {
    IDeinitizable,
    InvokableFn,
} from "@/utilities/_module-exports.js";

/**
 * Note the `MemoryCircuitBreakerStorageAdapter` is limited to single process usage and cannot be shared across multiple servers or different processes.
 * This adapter is meant for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/memory-circuit-breaker-storage-adapter"`
 * @group Adapters
 */
export class MemoryCircuitBreakerStorageAdapter<TType>
    implements ICircuitBreakerStorageAdapter<TType>, IDeinitizable
{
    /**
     *  @example
     * ```ts
     * import { MemoryCircuitBreakerStorageAdapter } from "@daiso-tech/core/circuit-breaker/memory-circuit-breaker-storage-adapter";
     *
     * const circuitBreakerStorageAdapter = new MemoryCircuitBreakerStorageAdapter();
     * ```
     * You can also provide an `Map`.
     * @example
     * ```ts
     * import { MemoryCircuitBreakerStorageAdapter } from "@daiso-tech/core/circuit-breaker/memory-circuit-breaker-storage-adapter";
     *
     * const map = new Map<any, any>();
     * const circuitBreakerStorageAdapter = new MemoryCircuitBreakerStorageAdapter(map);
     * ```
     */
    constructor(private readonly map = new Map<string, TType>()) {}

    /**
     * Removes all in-memory circuit breaker data.
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async deInit(): Promise<void> {
        this.map.clear();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    private async upsert(key: string, state: TType): Promise<void> {
        this.map.set(key, state);
    }

    async transaction<TValue>(
        fn: InvokableFn<
            [transaction: ICircuitBreakerStorageAdapterTransaction<TType>],
            Promise<TValue>
        >,
    ): Promise<TValue> {
        return await fn({
            upsert: (key, state) => this.upsert(key, state),
            find: (key) => this.find(key),
        });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async find(key: string): Promise<TType | null> {
        return this.map.get(key) ?? null;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async remove(key: string): Promise<void> {
        this.map.delete(key);
    }
}
