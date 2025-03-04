/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import type {
    ILockAdapter,
    ILockData,
} from "@/lock/contracts/_module-exports.js";

/**
 * Note the <i>MemoryLockAdapter</i> is limited to single process usage and cannot be shared across multiple servers or different processes.
 * This adapter is meant to be used for testing.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/adapters"```
 * @group Adapters
 */
export class MemoryLockAdapter implements ILockAdapter {
    private readonly timeoutMap = new Map<
        string,
        NodeJS.Timeout | string | number
    >();

    /**
     *  @example
     * ```ts
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     *
     * const lockAdapter = new MemoryLockAdapter({
     *   rootGroup: "@cache"
     * });
     * ```
     * You can also provide an <i>Map</i>.
     * @example
     * ```ts
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     *
     * const map = new Map<any, any>();
     * const lockAdapter = new MemoryLockAdapter({
     *   rootGroup: "@cache",
     *   map
     * });
     * ```
     */
    constructor(private readonly map = new Map<string, ILockData>()) {
        this.map = map;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const hasNotKey = !this.map.has(key);
        if (hasNotKey) {
            this.map.set(key, {
                owner,
                expiration: ttl?.toEndDate() ?? null,
            });
        }
        if (hasNotKey && ttl !== null) {
            this.timeoutMap.set(
                key,
                setTimeout(() => {
                    this.map.delete(key);
                    this.timeoutMap.delete(key);
                }, ttl.toMilliseconds()),
            );
        }
        return hasNotKey;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async release(key: string, owner: string): Promise<boolean> {
        const data = this.map.get(key);
        if (data === undefined) {
            return true;
        }
        if (data.owner !== owner) {
            return false;
        }
        clearTimeout(this.timeoutMap.get(key));
        this.timeoutMap.delete(key);
        this.map.delete(key);
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async forceRelease(key: string): Promise<void> {
        clearTimeout(this.timeoutMap.get(key));
        this.timeoutMap.delete(key);
        this.map.delete(key);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async refresh(
        key: string,
        owner: string,
        time: TimeSpan,
    ): Promise<boolean> {
        const data = this.map.get(key);
        if (data === undefined) {
            return true;
        }
        if (data.owner !== owner) {
            return false;
        }
        if (data.expiration === null) {
            return true;
        }

        this.map.set(key, {
            ...data,
            expiration: time.toEndDate(),
        });
        clearTimeout(this.timeoutMap.get(key));
        this.timeoutMap.set(
            key,
            setTimeout(() => {
                this.timeoutMap.delete(key);
                this.map.delete(key);
            }, time.toMilliseconds()),
        );
        return true;
    }
}
