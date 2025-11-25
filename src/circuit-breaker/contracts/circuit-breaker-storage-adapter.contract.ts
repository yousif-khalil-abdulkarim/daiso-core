/**
 * @module CircuitBreaker
 */

import { type InvokableFn } from "@/utilities/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type ICircuitBreakerStorageAdapterTransaction<TType = unknown> = {
    /**
     * The `upsert` inserts a circuit breaker if it doesnt exist otherwise it will be updated.
     *
     * @param key The unique identifier for the circuit breaker.
     */
    upsert(key: string, state: TType): Promise<void>;

    /**
     * Retrieves the current circuit breaker state for a given key.
     *
     * @param key The unique identifier for the cricuit breaker.
     * @returns Returns the circuit breaker state if found, otherwise `null`.
     */
    find(key: string): Promise<TType | null>;
};

/**
 * The `ICircuitBreakerStorageAdapter` contract defines a way for storing circuit breaker state independent of the underlying technology.
 * This contract simplifies the implementation of circuit breaker adapters with CRUD-based databases, such as SQL databases and ORMs like TypeOrm and MikroOrm.
 *
 * IMPORT_PATH: `"@daiso-tech/core/circuit-breaker/contracts"`
 * @group Contracts
 */
export type ICircuitBreakerStorageAdapter<TType = unknown> = {
    /**
     * The `transaction` method runs the `fn` function inside a transaction.
     * The `fn` function is given a {@link ICircuitBreakerStorageAdapterTransaction | `ICircuitBreakerStorageAdapterTransaction`} object.
     */
    transaction<TValue>(
        fn: InvokableFn<
            [transaction: ICircuitBreakerStorageAdapterTransaction<TType>],
            TValue
        >,
    ): Promise<TValue>;

    /**
     * Retrieves the current circuit breaker state for a given key.
     *
     * @param key The unique identifier for the cricuit breaker.
     * @returns Returns the circuit breaker state if found, otherwise `null`.
     */
    find(key: string): Promise<TType | null>;

    /**
     * Removes a circuit breaker from the database..
     *
     * @param key The unique identifier for the cricuit breaker to remove.
     */
    remove(key: string): Promise<void>;
};
