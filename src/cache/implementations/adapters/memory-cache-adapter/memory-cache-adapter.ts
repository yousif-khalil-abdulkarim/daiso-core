/**
 * @module Cache
 */

import { TypeCacheError } from "@/cache/contracts/cache.errors";
import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import type { TimeSpan } from "@/utilities/_module";

/**
 * To utilize the <i>MemoryCacheAdapter</i>, you must create instance of it.
 * @group Adapters
 * @example
 * ```ts
 * import { MemoryCacheAdapter } from "@daiso-tech/core";
 *
 * const cacheAdapter = new MemoryCacheAdapter(client);
 * ```
 * You can also provide an <i>Map</i>.
 * @example
 * ```ts
 * import { MemoryCacheAdapter } from "@daiso-tech/core";
 *
 * const map = new Map<any, any>();
 * const cacheAdapter = new MemoryCacheAdapter(map);
 * ```
 */
export class MemoryCacheAdapter<TType> implements ICacheAdapter<TType> {
    constructor(private readonly map: Map<string, TType> = new Map()) {}

    private readonly timeoutIdMap = new Map<
        string,
        NodeJS.Timeout | string | number
    >();

    // eslint-disable-next-line @typescript-eslint/require-await
    async get(key: string): Promise<TType | null> {
        return this.map.get(key) ?? null;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const hasNotkey = !this.map.has(key);
        if (hasNotkey) {
            this.map.set(key, value);
            if (ttl !== null) {
                const timeoutId = setTimeout(() => {
                    this.map.delete(key);
                    this.timeoutIdMap.delete(key);
                }, ttl.toMilliseconds());
                this.timeoutIdMap.set(key, timeoutId);
            }
        }
        return hasNotkey;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async update(key: string, value: TType): Promise<boolean> {
        const haskey = this.map.has(key);
        if (haskey) {
            this.map.set(key, value);
        }
        return haskey;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async put(
        key: string,
        value: TType,
        _ttl: TimeSpan | null,
    ): Promise<boolean> {
        const haskey = this.map.has(key);
        this.map.set(key, value);
        return haskey;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async remove(key: string): Promise<boolean> {
        const timeoutId = this.timeoutIdMap.get(key);
        clearTimeout(timeoutId);
        this.timeoutIdMap.delete(key);
        return this.map.delete(key);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async increment(key: string, value: number): Promise<boolean> {
        const mapValue = this.map.get(key);
        if (mapValue === undefined) {
            return false;
        }
        if (typeof mapValue !== "number") {
            throw new TypeCacheError(
                `Unable to increment or decrement none number type key "${key}"`,
            );
        }
        this.map.set(key, (mapValue + value) as TType);
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async clear(prefix: string): Promise<void> {
        if (prefix === "") {
            this.map.clear();
        }
        for (const [key] of this.map) {
            if (key.startsWith(prefix)) {
                const timeoutId = this.timeoutIdMap.get(key);
                clearTimeout(timeoutId);
                this.timeoutIdMap.delete(key);
                this.map.delete(key);
            }
        }
    }
}
