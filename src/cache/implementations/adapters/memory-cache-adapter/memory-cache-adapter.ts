/* eslint-disable @typescript-eslint/require-await */
/**
 * @module Cache
 */

import { TypeCacheError } from "@/cache/contracts/cache.errors";
import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import {
    simplifyGroupName,
    type OneOrMore,
    type TimeSpan,
} from "@/utilities/_module";

/**
 * To utilize the <i>MemoryCacheAdapter</i>, you must create instance of it.
 * @group Adapters
 */
export class MemoryCacheAdapter<TType> implements ICacheAdapter<TType> {
    private readonly group: string;

    private readonly timeoutMap = new Map<
        string,
        NodeJS.Timeout | string | number
    >();

    /**
     *  @example
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
     * const cacheAdapter = new MemoryCacheAdapter("@cache", map);
     * ```
     */
    constructor(
        rootGroup: OneOrMore<string>,
        private readonly map: Map<string, TType> = new Map(),
    ) {
        this.group = simplifyGroupName(rootGroup);
    }

    private getGroupName(): string {
        return simplifyGroupName([this.group, "__KEY__"]);
    }

    private withPrefix(key: string): string {
        return simplifyGroupName([this.getGroupName(), key]);
    }

    async exists(key: string): Promise<boolean> {
        key = this.withPrefix(key);
        return this.map.has(key);
    }

    async get(key: string): Promise<TType | null> {
        key = this.withPrefix(key);
        return this.map.get(key) ?? null;
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
            if (key.startsWith(this.getGroupName())) {
                clearTimeout(this.timeoutMap.get(key));
                this.timeoutMap.delete(key);
                this.map.delete(key);
            }
        }
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: OneOrMore<string>): ICacheAdapter<TType> {
        return new MemoryCacheAdapter([this.group, simplifyGroupName(group)]);
    }
}
