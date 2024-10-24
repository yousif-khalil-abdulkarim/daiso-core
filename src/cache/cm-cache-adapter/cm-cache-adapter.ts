/**
 * @module Cache
 */

import {
    type ICacheAdapter,
    type ValueWithTTL,
} from "@/contracts/cache/_module";
import { type createCache } from "cache-manager";

/**
 * @group Adapters
 */
export class CmCacheAdapter<TType> implements ICacheAdapter<TType> {
    constructor(private readonly client: ReturnType<typeof createCache>) {}

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        const result = {} as Record<TKeys, TValues | null>;
        for (const key of keys) {
            result[key] = await this.client.get(key);
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
            const hasNotKey = (await this.client.get(key)) === null;
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
            result[key] = (await this.client.get(key)) !== null;
            await this.client.del(key);
        }
        return result;
    }

    async clear(_namespace: string): Promise<void> {
        await this.client.clear();
    }
}
