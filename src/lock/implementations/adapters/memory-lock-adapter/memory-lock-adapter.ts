/**
 * @module Lock
 */

import type { IDeinitizable } from "@/utilities/_module-exports.js";
import type {
    ILockAdapter,
    ILockAdapterState,
} from "@/lock/contracts/_module-exports.js";
import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export type MemoryLockData =
    | {
          owner: string;
          hasExpiration: true;
          timeoutId: string | number | NodeJS.Timeout;
          expiration: Date;
      }
    | {
          owner: string;
          hasExpiration: false;
      };

/**
 * Note the `MemoryLockAdapter` is limited to single process usage and cannot be shared across multiple servers or different processes.
 * This adapter is meant to be used for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export class MemoryLockAdapter implements ILockAdapter, IDeinitizable {
    /**
     *  @example
     * ```ts
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     *
     * const lockAdapter = new MemoryLockAdapter();
     * ```
     * You can also provide an `Map`.
     * @example
     * ```ts
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     *
     * const map = new Map<any, any>();
     * const lockAdapter = new MemoryLockAdapter(map);
     * ```
     */
    constructor(private readonly map = new Map<string, MemoryLockData>()) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    async deInit(): Promise<void> {
        for (const [key, lockData] of this.map) {
            if (lockData.hasExpiration) {
                clearTimeout(lockData.timeoutId);
            }
            this.map.delete(key);
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async acquire(
        key: string,
        lockId: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        let lock = this.map.get(key);
        if (lock !== undefined) {
            return lock.owner === lockId;
        }

        if (ttl === null) {
            lock = {
                owner: lockId,
                hasExpiration: false,
            };
            this.map.set(key, lock);
        } else {
            const timeoutId = setTimeout(() => {
                this.map.delete(key);
            }, ttl.toMilliseconds());
            lock = {
                owner: lockId,
                hasExpiration: true,
                timeoutId,
                expiration: ttl.toEndDate(),
            };
            this.map.set(key, lock);
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async release(key: string, lockId: string): Promise<boolean> {
        const lock = this.map.get(key);
        if (lock === undefined) {
            return false;
        }
        if (lock.owner !== lockId) {
            return false;
        }

        if (lock.hasExpiration) {
            clearTimeout(lock.timeoutId);
        }
        this.map.delete(key);

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async forceRelease(key: string): Promise<boolean> {
        const lock = this.map.get(key);

        if (lock === undefined) {
            return false;
        }

        if (lock.hasExpiration) {
            clearTimeout(lock.timeoutId);
        }

        this.map.delete(key);

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async refresh(
        key: string,
        lockId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        const lock = this.map.get(key);
        if (lock === undefined) {
            return false;
        }
        if (lock.owner !== lockId) {
            return false;
        }
        if (!lock.hasExpiration) {
            return false;
        }

        clearTimeout(lock.timeoutId);
        const timeoutId = setTimeout(() => {
            this.map.delete(key);
        }, ttl.toMilliseconds());
        this.map.set(key, {
            ...lock,
            timeoutId,
        });

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getState(key: string): Promise<ILockAdapterState | null> {
        const lockData = this.map.get(key);
        if (lockData === undefined) {
            return null;
        }
        if (!lockData.hasExpiration) {
            return {
                owner: lockData.owner,
                expiration: null,
            };
        }
        if (lockData.expiration <= new Date()) {
            return null;
        }
        return {
            owner: lockData.owner,
            expiration: lockData.expiration,
        };
    }
}
