/**
 * @module CircuitBreaker
 */

import {
    type ICircuitBreakerStorageAdapter,
    type ICircuitBreakerStorageAdapterTransaction,
} from "@/circuit-breaker/contracts/_module-exports.js";
import type { InvokableFn } from "@/utilities/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/circiuit-breaker/database-circuit-breaker-storage-adapter"`
 * @group Adapters
 */
export class NoOpCirciuitBreakerStorageAdapter<TType>
    implements ICircuitBreakerStorageAdapter<TType>
{
    transaction<TValue>(
        fn: InvokableFn<
            [transaction: ICircuitBreakerStorageAdapterTransaction<TType>],
            TValue
        >,
    ): Promise<TValue> {
        return Promise.resolve(
            fn({
                find: (_key: string): Promise<TType | null> =>
                    Promise.resolve(null),
                upsert: (_key: string, _state: TType) => Promise.resolve(),
            }),
        );
    }

    find(_key: string): Promise<TType | null> {
        return Promise.resolve(null);
    }

    remove(_key: string): Promise<void> {
        return Promise.resolve();
    }
}
