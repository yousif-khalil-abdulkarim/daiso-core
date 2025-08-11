/**
 * @module Lock
 */

import type { IDeinitizable, TimeSpan } from "@/utilities/_module-exports.js";
import {
    LOCK_REFRESH_RESULT,
    type ILockAdapter,
    type LockRefreshResult,
} from "@/lock/contracts/_module-exports.js";

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
        owner: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        let lock = this.map.get(key);
        if (lock !== undefined) {
            return false;
        }

        if (ttl === null) {
            lock = {
                owner,
                hasExpiration: false,
            };
            this.map.set(key, lock);
        } else {
            const timeoutId = setTimeout(() => {
                this.map.delete(key);
            }, ttl.toMilliseconds());
            lock = {
                owner,
                hasExpiration: true,
                timeoutId,
            };
            this.map.set(key, lock);
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async release(key: string, owner: string): Promise<boolean> {
        const lock = this.map.get(key);
        if (lock === undefined) {
            return false;
        }
        if (lock.owner !== owner) {
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
        owner: string,
        ttl: TimeSpan,
    ): Promise<LockRefreshResult> {
        const lock = this.map.get(key);
        if (lock === undefined) {
            return LOCK_REFRESH_RESULT.UNOWNED_REFRESH;
        }
        if (lock.owner !== owner) {
            return LOCK_REFRESH_RESULT.UNOWNED_REFRESH;
        }
        if (!lock.hasExpiration) {
            return LOCK_REFRESH_RESULT.UNEXPIRABLE_KEY;
        }

        clearTimeout(lock.timeoutId);
        const timeoutId = setTimeout(() => {
            this.map.delete(key);
        }, ttl.toMilliseconds());
        this.map.set(key, {
            ...lock,
            timeoutId,
        });

        return LOCK_REFRESH_RESULT.REFRESHED;
    }
}
