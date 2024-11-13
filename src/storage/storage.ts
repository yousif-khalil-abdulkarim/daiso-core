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

export type StorageSettings = {
    namespace?: string;
};
export class Storage<TType> implements IStorage<TType> {
    private readonly storageAdapter: NamespaceStorageAdapter<TType>;

    constructor(
        storageAdapter: IStorageAdapter<TType>,
        { namespace = "" }: StorageSettings = {},
    ) {
        this.storageAdapter = new NamespaceStorageAdapter<TType>(
            new UsableStorageAdapter(storageAdapter),
            namespace,
        );
    }

    async [Symbol.asyncDispose](): Promise<void> {
        await this.clear();
    }

    async exists(key: string): Promise<boolean> {
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
    }

    async existsMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        try {
            return await this.storageAdapter.existsMany(keys);
        } catch (error: unknown) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new UnexpectedStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async missing(key: string): Promise<boolean> {
        const { [key]: hasKey } = await this.missingMany([key]);
        if (hasKey === undefined) {
            throw new UnexpectedStorageError(
                `Destructed field "key" is undefined`,
            );
        }
        return hasKey;
    }

    async missingMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        return Object.fromEntries(
            Object.entries(await this.existsMany(keys)).map(([key, hasKey]) => [
                key,
                !hasKey,
            ]),
        ) as Record<TKeys, boolean>;
    }

    async get<TValue extends TType>(key: string): Promise<TValue | null> {
        try {
            const { [key]: value } = await this.getMany<TValue, string>([key]);
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
    }

    async getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>> {
        try {
            return await this.storageAdapter.getMany(keys);
        } catch (error: unknown) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new UnexpectedStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async getOr<TValue extends TType, TExtended extends TType>(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended> {
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
    }

    async getOrMany<
        TValues extends TType,
        TExtended extends TType,
        TKeys extends string,
    >(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TExtended>>,
    ): Promise<Record<TKeys, TValues | TExtended>> {
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
    }

    async getOrFail<TValue extends TType>(key: string): Promise<TValue> {
        try {
            const value = await this.get<TValue>(key);
            if (value === null) {
                throw new KeyNotFoundStorageError(`Key "${key}" is not found`);
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
    }

    async add<TValue extends TType>(
        key: string,
        value: StorageValue<TValue>,
    ): Promise<boolean> {
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
    }

    async addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, StorageValue<TValues>>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            return await this.storageAdapter.addMany(values);
        } catch (error: unknown) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new UnexpectedStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async update<TValue extends TType>(
        key: string,
        value: TValue,
    ): Promise<boolean> {
        const { [key]: hasKey } = await this.updateMany({
            [key]: value,
        });
        if (hasKey === undefined) {
            throw new UnexpectedStorageError(
                `Destructed field "key" is undefined`,
            );
        }
        return hasKey;
    }

    async updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>> {
        return await this.storageAdapter.updateMany(values);
    }

    async put<TValue extends TType>(
        key: string,
        value: StorageValue<TValue>,
    ): Promise<boolean> {
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
    }

    async putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, StorageValue<TValues>>,
    ): Promise<Record<TKeys, boolean>> {
        try {
            return await this.storageAdapter.putMany(values);
        } catch (error: unknown) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new UnexpectedStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async remove(key: string): Promise<boolean> {
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
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        try {
            return await this.storageAdapter.removeMany(keys);
        } catch (error: unknown) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new UnexpectedStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async getAndRemove<TValue extends TType>(
        key: string,
    ): Promise<TValue | null> {
        try {
            return await this.storageAdapter.getAndRemove(key);
        } catch (error: unknown) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new UnexpectedStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: AsyncLazyable<StorageValue<GetOrAddValue<TExtended>>>,
    ): Promise<TValue | TExtended> {
        try {
            const value = await this.storageAdapter.getOrAdd<TValue, TExtended>(
                key,
                valueToAdd as AsyncLazyable<TExtended>,
            );
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
    }

    async increment(key: string, value: number = 1): Promise<boolean> {
        try {
            return await this.storageAdapter.increment(key, value);
        } catch (error: unknown) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new UnexpectedStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async decrement(key: string, value: number = 1): Promise<boolean> {
        try {
            return await this.storageAdapter.increment(key, -value);
        } catch (error: unknown) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new UnexpectedStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async clear(): Promise<void> {
        try {
            await this.storageAdapter.clear();
        } catch (error: unknown) {
            if (error instanceof StorageError) {
                throw error;
            }
            throw new UnexpectedStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}
