/**
 * @module Storage
 */

import {
    KeyNotFoundStorageError,
    UnexpectedStorageError,
    type IStorageAdapter,
} from "@/storage/contracts/_module";
import { type StorageValue, type IStorage } from "@/storage/contracts/_module";
import { WithNamespaceStorageAdapter } from "@/storage/implementations/storage/with-namespace-storage-adapter";
import { simplifyAsyncLazyable } from "@/_shared/utilities";
import { type AsyncLazyable, type GetOrAddValue } from "@/_shared/types";
import type { Validator } from "@/utilities/_module";
import { LazyPromise } from "@/utilities/_module";
import { WithValidationStorageAdapter } from "@/storage/implementations/storage/with-validation-storage-adapter";

export type StorageSettings<TType> = {
    namespace?: string;
    validator?: Validator<TType>;
};
export class Storage<TType = unknown> implements IStorage<TType> {
    private readonly namespaceStorageAdapter: WithNamespaceStorageAdapter<TType>;

    constructor(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private readonly storageAdapter: IStorageAdapter<any>,
        {
            namespace = "",
            validator = (v) => v as TType,
        }: StorageSettings<TType> = {},
    ) {
        this.namespaceStorageAdapter = new WithNamespaceStorageAdapter<TType>(
            new WithValidationStorageAdapter(this.storageAdapter, validator),
            namespace,
        );
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

    get(key: string): LazyPromise<TType | null> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getMany<string>([key]);
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return value;
        });
    }

    getMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, TType | null>> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.getMany(keys);
        });
    }

    getOr(key: string, defaultValue: AsyncLazyable<TType>): LazyPromise<TType> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getOrMany<string>({
                [key]: defaultValue,
            });
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return value as TType;
        });
    }

    getOrMany<TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TType>>,
    ): LazyPromise<Record<TKeys, TType>> {
        return new LazyPromise(async () => {
            const getManyResult = await this.getMany(
                Object.keys(keysWithDefaults),
            );
            const result = {} as Record<string, TType>;
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
                    )) as TType;
                } else {
                    result[key] = value as TType;
                }
            }
            return result;
        });
    }

    getOrFail(key: string): LazyPromise<TType> {
        return new LazyPromise(async () => {
            const value = await this.get(key);
            if (value === null) {
                throw new KeyNotFoundStorageError(`Key "${key}" is not found`);
            }
            return value;
        });
    }

    add(key: string, value: StorageValue<TType>): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasAdded } = await this.addMany<string>({
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

    addMany<TKeys extends string>(
        values: Record<TKeys, StorageValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.addMany(values);
        });
    }

    update(key: string, value: TType): LazyPromise<boolean> {
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

    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.updateMany(values);
        });
    }

    put(key: string, value: StorageValue<TType>): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasAdded } = await this.putMany<string>({
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

    putMany<TKeys extends string>(
        values: Record<TKeys, StorageValue<TType>>,
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

    getAndRemove(key: string): LazyPromise<TType | null> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getMany<string>([key]);
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            await this.namespaceStorageAdapter.removeMany([key]);
            return value;
        });
    }

    getOrAdd(
        key: string,
        valueToAdd: AsyncLazyable<StorageValue<GetOrAddValue<TType>>>,
    ): LazyPromise<TType> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getMany<string>([key]);
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            if (value === null) {
                const valueToAddSimplified = (await simplifyAsyncLazyable(
                    valueToAdd,
                )) as TType;
                await this.namespaceStorageAdapter.addMany({
                    [key]: valueToAddSimplified,
                });
                return valueToAddSimplified;
            }
            return value;
        });
    }

    increment(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            return await this.namespaceStorageAdapter.increment(key, value);
        });
    }

    decrement(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
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