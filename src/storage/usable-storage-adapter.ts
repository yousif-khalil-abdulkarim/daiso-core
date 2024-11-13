/**
 * @module Storage
 */

import type { AsyncLazyable, GetOrAddResult } from "@/_shared/types";
import { simplifyAsyncLazyable } from "@/_shared/utilities";
import {
    type IStorageAdapter,
    TypeStorageError,
    UnexpectedStorageError,
} from "@/contracts/storage/_module";

/**
 * @internal
 */
export class UsableStorageAdapter<TType>
    implements Required<Omit<IStorageAdapter<TType>, "getOrAdd">>
{
    constructor(private readonly storageAdapter: IStorageAdapter<TType>) {}

    async existsMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        if (this.storageAdapter.existsMany !== undefined) {
            return await this.storageAdapter.existsMany(keys);
        }
        const getResult = await this.getMany(keys);
        const results = {} as Record<TKeys, boolean>;
        for (const key in getResult) {
            results[key] = getResult[key] !== null;
        }
        return results;
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        return await this.storageAdapter.getMany(keys);
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.addMany(values);
    }

    async updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.updateMany(values);
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        if (this.storageAdapter.putMany !== undefined) {
            return await this.storageAdapter.putMany(values);
        }
        const removeResults = await this.removeMany(Object.keys(values));
        await this.addMany(values);
        return removeResults;
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.removeMany(keys);
    }

    async increment(key: string, value: number): Promise<boolean> {
        if (this.storageAdapter.increment !== undefined) {
            return await this.storageAdapter.increment(key, value);
        }
        const { [key]: previousValue } = await this.getMany([key]);
        if (previousValue === undefined) {
            throw new UnexpectedStorageError(
                `Destructed field "key" is undefined`,
            );
        }
        if (previousValue === null) {
            return false;
        }
        if (typeof previousValue !== "number") {
            throw new TypeStorageError(
                `Unable to increment or decrement none number type key "${key}"`,
            );
        }
        const newValue = previousValue + value;
        await this.updateMany({
            [key]: newValue as TType,
        });
        return true;
    }

    async getAndRemove<TValue extends TType>(
        key: string,
    ): Promise<TValue | null> {
        if (this.storageAdapter.getAndRemove !== undefined) {
            return await this.storageAdapter.getAndRemove(key);
        }
        const { [key]: value } = await this.getMany<TValue, string>([key]);
        if (value === undefined) {
            throw new UnexpectedStorageError(
                `Destructed field "key" is undefined`,
            );
        }
        await this.removeMany([key]);
        return value;
    }

    async getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: AsyncLazyable<TExtended>,
    ): Promise<GetOrAddResult<TValue | TExtended>> {
        if (
            typeof valueToAdd !== "function" &&
            this.storageAdapter.getOrAdd !== undefined
        ) {
            return await this.storageAdapter.getOrAdd<TValue, TExtended>(
                key,
                valueToAdd,
            );
        }
        const { [key]: value } = await this.getMany<TValue | TExtended, string>(
            [key],
        );
        if (value === undefined) {
            throw new UnexpectedStorageError(
                `Destructed field "key" is undefined`,
            );
        }
        if (value === null) {
            const valueToAddSimplified =
                await simplifyAsyncLazyable(valueToAdd);
            await this.addMany({
                [key]: valueToAddSimplified,
            });
            return {
                hasKey: false,
                value: valueToAddSimplified,
            };
        }
        return {
            hasKey: true,
            value,
        };
    }

    async clear(prefix: string): Promise<void> {
        await this.storageAdapter.clear(prefix);
    }
}
