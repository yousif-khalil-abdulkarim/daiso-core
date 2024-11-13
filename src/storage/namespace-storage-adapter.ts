/**
 * @module Storage
 */

import type { AsyncLazyable } from "@/_shared/types";
import { type IStorageAdapter } from "@/contracts/storage/_module";
import type { UsableStorageAdapter } from "@/storage/usable-storage-adapter";

/**
 * @internal
 */
export class NamespaceStorageAdapter<TType>
    implements Required<Omit<IStorageAdapter<TType>, "clear" | "getOrAdd">>
{
    constructor(
        private readonly usableStorageAdapter: UsableStorageAdapter<TType>,
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

    async existsMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.usableStorageAdapter.existsMany(
                this.withNamespaceArray(keys),
            ),
        );
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        return this.withoutNamespaceObject(
            await this.usableStorageAdapter.getMany(
                this.withNamespaceArray(keys),
            ),
        );
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.usableStorageAdapter.addMany(
                this.withNamespaceObject(values),
            ),
        );
    }

    async updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.usableStorageAdapter.updateMany(
                this.withNamespaceObject(values),
            ),
        );
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.usableStorageAdapter.putMany(
                this.withNamespaceObject(values),
            ),
        );
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.usableStorageAdapter.removeMany(
                this.withNamespaceArray(keys),
            ),
        );
    }

    async getAndRemove<TValue extends TType>(
        key: string,
    ): Promise<TValue | null> {
        return await this.usableStorageAdapter.getAndRemove(
            this.withNamespace(key),
        );
    }

    async getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended> {
        const { value } = await this.usableStorageAdapter.getOrAdd<
            TValue,
            TExtended
        >(this.withNamespace(key), valueToAdd);
        return value;
    }

    async increment(key: string, value: number): Promise<boolean> {
        return await this.usableStorageAdapter.increment(
            this.withNamespace(key),
            value,
        );
    }

    async decrement(key: string, value: number): Promise<boolean> {
        return await this.usableStorageAdapter.increment(
            this.withNamespace(key),
            -value,
        );
    }

    async clear(): Promise<void> {
        await this.usableStorageAdapter.clear(this.namespace);
    }
}
