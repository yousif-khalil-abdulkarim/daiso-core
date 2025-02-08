/**
 * @module Lock
 */

import { simplifyGroupName, TimeSpan } from "@/utilities/_module";
import type { ILockAdapter, ILockData } from "@/lock/contracts/_module";

/**
 * @group Adapters
 */
export type MemoryLockAdapterSettings = {
    rootGroup: string;
    map?: Map<string, ILockData>;
};

/**
 * @group Adapters
 */
export class MemoryLockAdapter implements ILockAdapter {
    private readonly group: string;

    private readonly timeoutMap = new Map<
        string,
        NodeJS.Timeout | string | number
    >();

    private readonly map: Map<string, ILockData>;

    /**
     *  @example
     * ```ts
     * import { MemoryLockAdapter } from "@daiso-tech/core";
     *
     * const lockAdapter = new MemoryLockAdapter({
     *   rootGroup: "@cache"
     * });
     * ```
     * You can also provide an <i>Map</i>.
     * @example
     * ```ts
     * import { MemoryLockAdapter } from "@daiso-tech/core";
     *
     * const map = new Map<any, any>();
     * const lockAdapter = new MemoryLockAdapter({
     *   rootGroup: "@cache",
     *   map
     * });
     * ```
     */
    constructor(settings: MemoryLockAdapterSettings) {
        const { rootGroup, map = new Map<string, ILockData>() } = settings;
        this.map = map;
        this.group = rootGroup;
    }

    private getPrefix(): string {
        return simplifyGroupName([this.group, "__KEY__"]);
    }

    private withPrefix(key: string): string {
        return simplifyGroupName([this.getPrefix(), key]);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        key = this.withPrefix(key);
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
        key = this.withPrefix(key);
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
        key = this.withPrefix(key);
        clearTimeout(this.timeoutMap.get(key));
        this.timeoutMap.delete(key);
        this.map.delete(key);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async isLocked(key: string): Promise<boolean> {
        key = this.withPrefix(key);
        return this.map.has(key);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getRemainingTime(key: string): Promise<TimeSpan | null> {
        key = this.withPrefix(key);
        const lock = this.map.get(key);
        if (lock === undefined) {
            return null;
        }
        const { expiration } = lock;
        if (expiration === null) {
            return null;
        }
        return TimeSpan.fromDateRange(new Date(), expiration);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async refresh(
        key: string,
        owner: string,
        time: TimeSpan,
    ): Promise<boolean> {
        key = this.withPrefix(key);
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

    getGroup(): string {
        return this.group;
    }

    withGroup(group: string): ILockAdapter {
        return new MemoryLockAdapter({
            map: this.map,
            rootGroup: simplifyGroupName([this.group, group]),
        });
    }
}
