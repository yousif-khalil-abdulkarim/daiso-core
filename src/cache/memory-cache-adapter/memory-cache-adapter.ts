/**
 * @module Cache
 */

import {
    type ValueWithTTL,
    type ICacheAdapter,
} from "@/contracts/cache/_module";

/**
 * @group Adapters
 */
export class MemoryCacheAdapter<TType> implements ICacheAdapter<TType> {
    private setTimeoutIds = new Map<string, ReturnType<typeof setTimeout>>();

    constructor(private readonly map: Map<string, TType>) {}

    getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        const values = {} as Record<TKeys, TValues | null>;
        for (const key of keys) {
            const value = this.map.get(key) ?? null;
            values[key] = value as TValues | null;
        }
        return Promise.resolve(values);
    }

    addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        const result = {} as Record<TKeys, boolean>;
        for (const key in values) {
            const {
                [key]: { value, ttlInMs },
            } = values;
            const hasKey = this.map.has(key);
            if (!hasKey) {
                if (ttlInMs) {
                    const setTimeoutId = setTimeout(() => {
                        this.map.delete(key);
                        this.setTimeoutIds.delete(key);
                    }, ttlInMs);
                    this.setTimeoutIds.set(key, setTimeoutId);
                }
                this.map.set(key, value);
            }
            result[key] = !hasKey;
        }
        return Promise.resolve(result);
    }

    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const result = {} as Record<TKeys, boolean>;
        for (const key of keys) {
            result[key] = this.map.delete(key);
            const timeoutId = this.setTimeoutIds.get(key);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            this.setTimeoutIds.delete(key);
        }
        return Promise.resolve(result);
    }

    async clear(prefix: string): Promise<void> {
        if (prefix === "") {
            this.map.clear();
        }
        const keys: string[] = [];
        for (const key of this.map.keys()) {
            if (key.startsWith(prefix)) {
                keys.push(key);
            }
        }
        await this.removeMany(keys);
    }
}
