/**
 * @module RateLimiter
 */

import type {
    IRateLimiterAdapter,
    IRateLimiterAdapterState,
} from "@/rate-limiter/contracts/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/rate-limiter/no-op-rate-limiter-adapter"`
 * @group Adapters
 */
export class NoOpRateLimiterAdapter implements IRateLimiterAdapter {
    getState(_key: string): Promise<IRateLimiterAdapterState> {
        return Promise.resolve({
            success: true,
            attempt: 1,
            resetTime: null,
        });
    }

    updateState(
        _key: string,
        limit: number,
    ): Promise<IRateLimiterAdapterState> {
        return Promise.resolve({
            success: true,
            attempt: 1,
            limit,
            resetTime: null,
        });
    }

    reset(_key: string): Promise<void> {
        return Promise.resolve();
    }
}
