/**
 * @module RateLimiter
 */

import type {
    IRateLimiterData,
    IRateLimiterStorageAdapter,
    IRateLimiterStorageAdapterTransaction,
} from "@/rate-limiter/contracts/_module-exports.js";
import type { InvokableFn } from "@/utilities/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/no-op-rate-limiter-storage-adapter"`
 * @internal
 */
class NoOpRateLimiterStorageAdapterTransaction<TType>
    implements IRateLimiterStorageAdapterTransaction<TType>
{
    upsert(
        _key: string,
        _state: TType,
        _expiration: Date | null,
    ): Promise<void> {
        return Promise.resolve();
    }

    find(_key: string): Promise<IRateLimiterData<TType> | null> {
        return Promise.resolve(null);
    }
}

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/no-op-rate-limiter-storage-adapter"`
 * @group Adapters
 */
export class NoOpRateLimiterStorageAdapter<TType>
    implements IRateLimiterStorageAdapter<TType>
{
    transaction<TValue>(
        fn: InvokableFn<
            [transaction: IRateLimiterStorageAdapterTransaction<TType>],
            Promise<TValue>
        >,
    ): Promise<TValue> {
        return Promise.resolve(
            fn(new NoOpRateLimiterStorageAdapterTransaction()),
        );
    }

    find(_key: string): Promise<IRateLimiterData<TType> | null> {
        return Promise.resolve(null);
    }

    remove(_key: string): Promise<void> {
        return Promise.resolve();
    }
}
