/**
 * @module Cache
 */

import {
    type ValueWithTTL,
    type ICacheAdapter,
} from "@/contracts/cache/_module";
import type Keyv from "keyv";

/**
 * @group Adapters
 */
export class KeyvCacheAdapter<TType> implements ICacheAdapter<TType> {
    constructor(private readonly client: Keyv<TType>) {}

    async hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const result = {} as Record<TKeys, boolean>;
        for (const key of keys) {
            result[key] = await this.client.has(key);
        }
        return result;
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        const result = {} as Record<TKeys, TValues | null>;
        for (const key of keys) {
            result[key] = (await this.client.get(key)) ?? null;
        }
        return result;
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        const result = {} as Record<TKeys, boolean>;
        for (const key in values) {
            const {
                [key]: { value, ttlInMs },
            } = values;
            const hasNotKey = !(await this.client.has(key));
            if (hasNotKey) {
                await this.client.set(key, value, ttlInMs ?? undefined);
            }
            result[key] = hasNotKey;
        }
        return result;
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const result = {} as Record<TKeys, boolean>;
        for (const key of keys) {
            result[key] = await this.client.delete(key);
        }
        return result;
    }

    async clear(_namespace: string): Promise<void> {
        await this.client.clear();
    }
}
