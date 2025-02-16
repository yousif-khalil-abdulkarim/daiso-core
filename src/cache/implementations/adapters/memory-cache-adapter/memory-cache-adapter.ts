/* eslint-disable @typescript-eslint/require-await */
/**
 * @module Cache
 */

import { TypeCacheError } from "@/cache/contracts/cache.errors.js";
import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract.js";
import {
    simplifyOneOrMoreStr,
    type TimeSpan,
} from "@/utilities/_module-exports.js";

/**
 * @group Adapters
 */
export type MemoryCacheAdapterSettings = {
    rootGroup: string;
    map?: Map<string, unknown>;
};

/**
 * To utilize the <i>MemoryCacheAdapter</i>, you must create instance of it.
 * @group Adapters
 */
export class MemoryCacheAdapter<TType = unknown>
    implements ICacheAdapter<TType>
{
    private readonly group: string;

    private readonly timeoutMap = new Map<
        string,
        NodeJS.Timeout | string | number
    >();

    private readonly map: Map<string, unknown>;

    /**
     *  @example
     * ```ts
     * import { MemoryCacheAdapter } from "@daiso-tech/core";
     *
     * const cacheAdapter = new MemoryCacheAdapter({
     *   rootGroup: "@cache"
     * });
     * ```
     * You can also provide an <i>Map</i>.
     * @example
     * ```ts
     * import { MemoryCacheAdapter } from "@daiso-tech/core";
     *
     * const map = new Map<any, any>();
     * const cacheAdapter = new MemoryCacheAdapter({
     *   rootGroup: "@cache",
     *   map
     * });
     * ```
     */
    constructor(settings: MemoryCacheAdapterSettings) {
        const { rootGroup, map = new Map<string, unknown>() } = settings;
        this.map = map;
        this.group = rootGroup;
    }

    private getPrefix(): string {
        return simplifyOneOrMoreStr([this.group, "__KEY__"]);
    }

    private withPrefix(key: string): string {
        return simplifyOneOrMoreStr([this.getPrefix(), key]);
    }

    async get(key: string): Promise<TType | null> {
        key = this.withPrefix(key);
        return (this.map.get(key) as TType) ?? null;
    }

    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        key = this.withPrefix(key);
        const hasNotKey = !this.map.has(key);
        if (hasNotKey) {
            this.map.set(key, value);
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

    async update(key: string, value: TType): Promise<boolean> {
        key = this.withPrefix(key);
        const hasKey = this.map.has(key);
        if (hasKey) {
            this.map.set(key, value);
        }
        return hasKey;
    }

    async put(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const hasKey = await this.remove(key);
        await this.add(key, value, ttl);
        return hasKey;
    }

    async remove(key: string): Promise<boolean> {
        key = this.withPrefix(key);
        clearTimeout(this.timeoutMap.get(key));
        this.timeoutMap.delete(key);
        return this.map.delete(key);
    }

    async increment(key: string, value: number): Promise<boolean> {
        key = this.withPrefix(key);
        const prevValue = this.map.get(key);
        const hasKey = prevValue !== undefined;
        if (hasKey) {
            if (typeof prevValue !== "number") {
                throw new TypeCacheError(
                    `Unable to increment or decrement none number type key "${key}"`,
                );
            }
            const newValue = prevValue + value;
            this.map.set(key, newValue as TType);
        }
        return hasKey;
    }

    async clear(): Promise<void> {
        for (const key of this.map.keys()) {
            if (key.startsWith(this.getPrefix())) {
                clearTimeout(this.timeoutMap.get(key));
                this.timeoutMap.delete(key);
                this.map.delete(key);
            }
        }
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: string): ICacheAdapter<TType> {
        return new MemoryCacheAdapter({
            map: this.map,
            rootGroup: simplifyOneOrMoreStr([this.group, group]),
        });
    }
}
