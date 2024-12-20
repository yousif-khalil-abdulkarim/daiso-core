/**
 * @module Storage
 */

import { type IStorageAdapter } from "@/contracts/storage/storage-adapter.contract";

/**
 * @group Adapters
 */
export class MemoryStorageAdapter<TType> implements IStorageAdapter<TType> {
    constructor(private readonly map: Map<string, TType> = new Map()) {}

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
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        const result = {} as Record<TKeys, boolean>;
        for (const key in values) {
            const { [key]: value } = values;
            const hasKey = this.map.has(key);
            if (!hasKey) {
                this.map.set(key, value);
            }
            result[key] = !hasKey;
        }
        return Promise.resolve(result);
    }

    updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        const results = {} as Record<TKeys, boolean>;
        for (const key in values) {
            const { [key]: value } = values;
            const hasKey = this.map.has(key);
            if (hasKey) {
                this.map.set(key, value);
            }
            results[key] = hasKey;
        }
        return Promise.resolve(results);
    }

    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const result = {} as Record<TKeys, boolean>;
        for (const key of keys) {
            result[key] = this.map.delete(key);
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
