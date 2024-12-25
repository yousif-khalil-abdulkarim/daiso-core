/**
 * @module Storage
 */

import {
    KeyNotFoundStorageError,
    UnexpectedStorageError,
    type IStorageAdapter,
} from "@/contracts/storage/_module";
import { type StorageValue, type IStorage } from "@/contracts/storage/_module";
import { NamespaceStorageAdapter } from "@/storage/namespace-storage-adapter";
import { simplifyAsyncLazyable } from "@/_shared/utilities";
import { type AsyncLazyable, type GetOrAddValue } from "@/_shared/types";
import { LazyPromise } from "@/async/_module";

export type StorageSettings = {
    namespace?: string;
};
export class Storage<TType = unknown> implements IStorage<TType> {
    private readonly namespaceStorageAdapter: NamespaceStorageAdapter<TType>;
    private readonly settings: Required<StorageSettings>;

    constructor(
        private readonly storageAdapter: IStorageAdapter<TType>,
        { namespace = "" }: StorageSettings = {},
    ) {
        this.settings = {
            namespace,
        };
        this.namespaceStorageAdapter = new NamespaceStorageAdapter<TType>(
            this.storageAdapter,
            this.settings.namespace,
        );
    }

    namespace<TNamespaceType extends TType>(
        name: string,
    ): IStorage<TNamespaceType> {
        return new Storage<TNamespaceType>(this.storageAdapter, {
            ...this.settings,
            namespace: `${this.settings.namespace}${name}`,
        });
    }

    exists(key: string): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasKey } = await this.existsMany([key]);
            if (hasKey === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasKey;
        });
    }

    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            const getResult = await this.getMany(keys);
            const results = {} as Record<TKeys, boolean>;
            for (const key in getResult) {
                results[key] = getResult[key] !== null;
            }
            return results;
        });
    }

    missing(key: string): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasKey } = await this.missingMany([key]);
            if (hasKey === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasKey;
        });
    }

    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            return Object.fromEntries(
                Object.entries(await this.existsMany(keys)).map(
                    ([key, hasKey]) => [key, !hasKey],
                ),
            ) as Record<TKeys, boolean>;
        });
    }

    get<TValue extends TType>(key: string): LazyPromise<TValue | null> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getMany<TValue, string>([key]);
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return value;
        });
    }

    getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, TValues | null>> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.getMany(keys);
        });
    }

    getOr<TValue extends TType, TExtended extends TType>(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): LazyPromise<TValue | TExtended> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getOrMany<
                TValue,
                TExtended,
                string
            >({
                [key]: defaultValue,
            });
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return value;
        });
    }

    getOrMany<
        TValues extends TType,
        TExtended extends TType,
        TKeys extends string,
    >(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TExtended>>,
    ): LazyPromise<Record<TKeys, TValues | TExtended>> {
        return new LazyPromise(async () => {
            const getManyResult = await this.getMany(
                Object.keys(keysWithDefaults),
            );
            const result = {} as Record<string, TValues | TExtended>;
            for (const key in getManyResult) {
                const { [key]: value } = getManyResult;
                if (value === undefined) {
                    throw new UnexpectedStorageError(
                        `Destructed field "key" is undefined`,
                    );
                }
                if (value === null) {
                    const defaultValue = keysWithDefaults[key as TKeys];
                    result[key] = (await simplifyAsyncLazyable(
                        defaultValue,
                    )) as TExtended;
                } else {
                    result[key] = value as TValues;
                }
            }
            return result;
        });
    }

    getOrFail<TValue extends TType>(key: string): LazyPromise<TValue> {
        return new LazyPromise(async () => {
            const value = await this.get<TValue>(key);
            if (value === null) {
                throw new KeyNotFoundStorageError(`Key "${key}" is not found`);
            }
            return value;
        });
    }

    add<TValue extends TType>(
        key: string,
        value: StorageValue<TValue>,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasAdded } = await this.addMany<TValue, string>({
                [key]: value,
            });
            if (hasAdded === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasAdded;
        });
    }

    addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, StorageValue<TValues>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.addMany(values);
        });
    }

    update<TValue extends TType>(
        key: string,
        value: TValue,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasKey } = await this.updateMany({
                [key]: value,
            });
            if (hasKey === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasKey;
        });
    }

    updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.updateMany(values);
        });
    }

    put<TValue extends TType>(
        key: string,
        value: StorageValue<TValue>,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasAdded } = await this.putMany<TValue, string>({
                [key]: value,
            });
            if (hasAdded === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasAdded;
        });
    }

    putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, StorageValue<TValues>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.putMany(values);
        });
    }

    remove(key: string): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasAdded } = await this.removeMany([key]);
            if (hasAdded === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasAdded;
        });
    }

    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.removeMany(keys);
        });
    }

    getAndRemove<TValue extends TType>(
        key: string,
    ): LazyPromise<TValue | null> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getMany<TValue, string>([key]);
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            await this.namespaceStorageAdapter.removeMany([key]);
            return value;
        });
    }

    getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: AsyncLazyable<StorageValue<GetOrAddValue<TExtended>>>,
    ): LazyPromise<TValue | TExtended> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getMany<
                TValue | TExtended,
                string
            >([key]);
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            if (value === null) {
                const valueToAddSimplified = (await simplifyAsyncLazyable(
                    valueToAdd,
                )) as TExtended;
                await this.namespaceStorageAdapter.addMany({
                    [key]: valueToAddSimplified,
                });
                return valueToAddSimplified;
            }
            return value;
        });
    }

    increment(key: string, value: number = 1): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.increment(key, value);
        });
    }

    decrement(key: string, value: number = 1): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.increment(key, -value);
        });
    }

    clear(): LazyPromise<void> {
        return new LazyPromise(async () => {
            await this.namespaceStorageAdapter.clear();
        });
    }
}
