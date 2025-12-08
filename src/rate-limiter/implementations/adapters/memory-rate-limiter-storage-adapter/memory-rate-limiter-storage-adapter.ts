/**
 * @module RateLimiter
 */

import type {
    IRateLimiterData,
    IRateLimiterStorageAdapter,
    IRateLimiterStorageAdapterTransaction,
} from "@/rate-limiter/contracts/_module-exports.js";
import type {
    IDeinitizable,
    InvokableFn,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/memory-rate-limiter-storage-adapter"`
 * @group Adapters
 */
export type MemoryRateLimiterData<TType = unknown> = {
    state: TType;
    timeoutId: string | number | NodeJS.Timeout | null;
    expiration: Date | null;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/memory-rate-limiter-storage-adapter"`
 * @group Adapters
 */
export class MemoryRateLimiterStorageAdapter<TType>
    implements IRateLimiterStorageAdapter<TType>, IDeinitizable
{
    /**
     * @example
     * ```ts
     * import { MemoryRateLimiterStorageAdapter } from "@daiso-tech/core/rate-limiter/memory-rate-limiter-storage-adapter";
     *
     * const rateLimiterStorageAdapter = new MemoryRateLimiterStorageAdapter();
     * ```
     */
    constructor(
        private readonly map = new Map<string, MemoryRateLimiterData<TType>>(),
    ) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    async deInit(): Promise<void> {
        for (const [key, { timeoutId }] of this.map) {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
            this.map.delete(key);
        }
        this.map.clear();
    }

    async transaction<TValue>(
        fn: InvokableFn<
            [transaction: IRateLimiterStorageAdapterTransaction<TType>],
            Promise<TValue>
        >,
    ): Promise<TValue> {
        return await fn({
            // eslint-disable-next-line @typescript-eslint/require-await
            upsert: async (
                key: string,
                state: TType,
                expiration: Date | null,
            ): Promise<void> => {
                const timeoutId: string | number | NodeJS.Timeout | null = null;
                if (expiration !== null) {
                    const ttl = expiration.getTime() - Date.now();
                    setTimeout(() => {
                        this.map.delete(key);
                    }, ttl);
                }
                this.map.set(key, {
                    state,
                    expiration,
                    timeoutId,
                });
            },
            find: (key: string): Promise<IRateLimiterData<TType> | null> => {
                return this.find(key);
            },
        });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async find(key: string): Promise<IRateLimiterData<TType> | null> {
        const data = this.map.get(key);
        if (data === undefined) {
            return null;
        }
        return {
            state: data.state,
            expiration: data.expiration,
        };
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async remove(key: string): Promise<void> {
        const data = this.map.get(key);
        if (data === undefined) {
            return;
        }
        if (data.timeoutId !== null) {
            clearTimeout(data.timeoutId);
        }
        this.map.delete(key);
    }
}
