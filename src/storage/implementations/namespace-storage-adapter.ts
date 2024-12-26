/**
 * @module Storage
 */

import { type IStorageAdapter } from "@/storage/contracts/_module";

/**
 * @internal
 */
export class NamespaceStorageAdapter<TType>
    implements Required<Omit<IStorageAdapter<TType>, "clear" | "getOrAdd">>
{
    constructor(
        private readonly storageAdapter: IStorageAdapter<TType>,
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

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        return this.withoutNamespaceObject(
            await this.storageAdapter.getMany(this.withNamespaceArray(keys)),
        );
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.storageAdapter.addMany(this.withNamespaceObject(values)),
        );
    }

    async updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.storageAdapter.updateMany(
                this.withNamespaceObject(values),
            ),
        );
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.storageAdapter.putMany(this.withNamespaceObject(values)),
        );
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return this.withoutNamespaceObject(
            await this.storageAdapter.removeMany(this.withNamespaceArray(keys)),
        );
    }

    async increment(key: string, value: number): Promise<boolean> {
        return await this.storageAdapter.increment(
            this.withNamespace(key),
            value,
        );
    }

    async decrement(key: string, value: number): Promise<boolean> {
        return await this.storageAdapter.increment(
            this.withNamespace(key),
            -value,
        );
    }

    async clear(): Promise<void> {
        await this.storageAdapter.clear(this.namespace);
    }
}
