/**
 * @module SharedLock
 */

import type {
    ISharedLockAdapter,
    ISharedLockAdapterState,
    SharedLockAcquireSettings,
} from "@/shared-lock/contracts/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { Redis } from "ioredis";

declare module "ioredis" {
    interface RedisCommander<Context> {}
}

/**
 * To utilize the `RedisSharedLockAdapter`, you must install the [`"ioredis"`](https://www.npmjs.com/package/ioredis) package.
 *
 * Note in order to use `RedisSharedLockAdapter` correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export class RedisSharedLockAdapter implements ISharedLockAdapter {
    /**
     * @example
     * ```ts
     * import { RedisSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
     * import Redis from "ioredis";
     *
     * const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const lockAdapter = new RedisSharedLockAdapter(database);
     * ```
     */
    constructor(private readonly database: Redis) {}

    acquireWriter(
        key: string,
        lockId: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    releaseWriter(key: string, lockId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forceReleaseWriter(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    refreshWriter(
        key: string,
        lockId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    acquireReader(settings: SharedLockAcquireSettings): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    releaseReader(key: string, slotId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forceReleaseAllReaders(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    refreshReader(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forceRelease(key: string, slotId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    getState(key: string): Promise<ISharedLockAdapterState | null> {
        throw new Error("Method not implemented.");
    }
}
