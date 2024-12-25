/**
 * @module Storage
 */

import {
    KeyNotFoundStorageError,
    StorageError,
    UnexpectedStorageError,
    type IStorageAdapter,
} from "@/contracts/storage/_module";
import { type StorageValue, type IStorage } from "@/contracts/storage/_module";
import { UsableStorageAdapter } from "@/storage/usable-storage-adapter";
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
        settings: StorageSettings = {},
    ) {
        this.settings = {
            namespace: "",
            ...settings,
        };
        this.namespaceStorageAdapter = new NamespaceStorageAdapter<TType>(
            new UsableStorageAdapter(this.storageAdapter),
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
            try {
                const { [key]: hasKey } = await this.existsMany([key]);
                if (hasKey === undefined) {
                    throw new UnexpectedStorageError(
                        `Destructed field "key" is undefined`,
                    );
                }
                return hasKey;
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            try {
                return await this.namespaceStorageAdapter.existsMany(keys);
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
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
            try {
                const { [key]: value } = await this.getMany<TValue, string>([
                    key,
                ]);
                if (value === undefined) {
                    throw new UnexpectedStorageError(
                        `Destructed field "key" is undefined`,
                    );
                }
                return value;
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, TValues | null>> {
        return new LazyPromise(async () => {
            try {
                return await this.namespaceStorageAdapter.getMany(keys);
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    getOr<TValue extends TType, TExtended extends TType>(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): LazyPromise<TValue | TExtended> {
        return new LazyPromise(async () => {
            try {
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
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
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
            try {
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
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    getOrFail<TValue extends TType>(key: string): LazyPromise<TValue> {
        return new LazyPromise(async () => {
            try {
                const value = await this.get<TValue>(key);
                if (value === null) {
                    throw new KeyNotFoundStorageError(
                        `Key "${key}" is not found`,
                    );
                }
                return value;
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    add<TValue extends TType>(
        key: string,
        value: StorageValue<TValue>,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            try {
                const { [key]: hasAdded } = await this.addMany<TValue, string>({
                    [key]: value,
                });
                if (hasAdded === undefined) {
                    throw new UnexpectedStorageError(
                        `Destructed field "key" is undefined`,
                    );
                }
                return hasAdded;
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, StorageValue<TValues>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            try {
                return await this.namespaceStorageAdapter.addMany(values);
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
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
            try {
                const { [key]: hasAdded } = await this.putMany<TValue, string>({
                    [key]: value,
                });
                if (hasAdded === undefined) {
                    throw new UnexpectedStorageError(
                        `Destructed field "key" is undefined`,
                    );
                }
                return hasAdded;
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, StorageValue<TValues>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            try {
                return await this.namespaceStorageAdapter.putMany(values);
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    remove(key: string): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            try {
                const { [key]: hasAdded } = await this.removeMany([key]);
                if (hasAdded === undefined) {
                    throw new UnexpectedStorageError(
                        `Destructed field "key" is undefined`,
                    );
                }
                return hasAdded;
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            try {
                return await this.namespaceStorageAdapter.removeMany(keys);
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    getAndRemove<TValue extends TType>(
        key: string,
    ): LazyPromise<TValue | null> {
        return new LazyPromise(async () => {
            try {
                return await this.namespaceStorageAdapter.getAndRemove(key);
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: AsyncLazyable<StorageValue<GetOrAddValue<TExtended>>>,
    ): LazyPromise<TValue | TExtended> {
        return new LazyPromise(async () => {
            try {
                const value = await this.namespaceStorageAdapter.getOrAdd<
                    TValue,
                    TExtended
                >(key, valueToAdd as AsyncLazyable<TExtended>);
                return value;
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    increment(key: string, value: number = 1): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            try {
                return await this.namespaceStorageAdapter.increment(key, value);
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    decrement(key: string, value: number = 1): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            try {
                return await this.namespaceStorageAdapter.increment(
                    key,
                    -value,
                );
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }

    clear(): LazyPromise<void> {
        return new LazyPromise(async () => {
            try {
                await this.namespaceStorageAdapter.clear();
            } catch (error: unknown) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new UnexpectedStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        });
    }
}
