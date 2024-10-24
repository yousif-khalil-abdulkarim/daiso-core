/**
 * @module Cache
 */

import {
    type ValueWithTTL,
    type ICacheAdapter,
} from "@/contracts/cache/_module";

/**
 * @internal
 */
export class NamespaceCacheAdapter<TType> {
    constructor(
        private readonly chacheAdapter: Required<ICacheAdapter<TType>>,
        private readonly namespace: string,
    ) {}

    private withNamespace(key: string): string {
        return `${this.namespace}${key}`;
    }

    private withNamespaceArray(keys: string[]): string[] {
        return keys.map((key) => this.withNamespace(key));
    }

    private withNamespaceObject<TValue>(
        object: Record<string, TValue>,
    ): Record<string, TValue> {
        return Object.fromEntries(
            Object.entries(object).map(([key, value]) => {
                return [this.withNamespace(key), value];
            }),
        );
    }

    private withoutNamespace(key: string): string {
        return key.slice(this.namespace.length);
    }

    private withoutNamespaceObject<TValue>(
        object: Record<string, TValue>,
    ): Record<string, TValue> {
        return Object.fromEntries(
            Object.entries(object).map(([key, value]) => {
                return [this.withoutNamespace(key), value];
            }),
        );
    }

    async hasMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.chacheAdapter.hasMany(this.withNamespaceArray(keys)),
        );
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        return this.withoutNamespaceObject(
            await this.chacheAdapter.getMany(this.withNamespaceArray(keys)),
        );
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.chacheAdapter.addMany(this.withNamespaceObject(values)),
        );
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, Required<ValueWithTTL<TValues>>>,
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.chacheAdapter.putMany(this.withNamespaceObject(values)),
        );
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.chacheAdapter.removeMany(this.withNamespaceArray(keys)),
        );
    }

    async getAndRemove<TValue extends TType>(
        key: string,
    ): Promise<TValue | null> {
        return await this.chacheAdapter.getAndRemove(this.withNamespace(key));
    }

    async getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: TExtended,
        ttlInMs: number | null,
    ): Promise<TValue | TExtended> {
        return await this.chacheAdapter.getOrAdd(
            this.withNamespace(key),
            valueToAdd,
            ttlInMs,
        );
    }

    async increment(key: string, value: number): Promise<boolean> {
        return await this.chacheAdapter.increment(
            this.withNamespace(key),
            value,
        );
    }

    async decrement(key: string, value: number): Promise<boolean> {
        return await this.chacheAdapter.increment(
            this.withNamespace(key),
            -value,
        );
    }

    async clear(): Promise<void> {
        await this.chacheAdapter.clear(this.namespace);
    }
}
