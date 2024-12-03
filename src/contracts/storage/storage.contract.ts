/**
 * @module Storage
 */

import {
    type AnyFunction,
    type AsyncLazyable,
    type GetOrAddValue,
} from "@/_shared/types";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type StorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeStorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedStorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type KeyNotFoundStorageError,
} from "@/contracts/storage/_shared";

export type StorageValue<T> = Exclude<T, AnyFunction | undefined | null>;

/**
 * @throws {StorageError} {@link StorageError}
 * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
 * @throws {TypeStorageError} {@link TypeStorageError}
 * @group Contracts
 */
export type IStorage<TType = unknown> = {
    namespace<TNamespaceType extends TType>(
        name: string,
    ): IStorage<TNamespaceType>;

    /**
     * Returns true when key is found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    exists(key: string): Promise<boolean>;

    /**
     * Returns true for the keys that are found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>>;

    /**
     * Returns true when key is not found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    missing(key: string): Promise<boolean>;

    /**
     * Returns true for the keys that are not found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>>;

    /**
     * Returns the value when key is found otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    get<TValue extends TType>(key: string): Promise<TValue | null>;

    /**
     * Returns the value for the keys that are found otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TValues | null>>;

    /**
     * Returns the value when key is found otherwise defaultValue will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getOr<TValue extends TType, TExtended extends TType>(
        key: string,
        defaultValue: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended>;

    /**
     * Returns the value for the keys that are found otherwise defaultValue will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getOrMany<
        TValues extends TType,
        TExtended extends TType,
        TKeys extends string,
    >(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TExtended>>,
    ): Promise<Record<TKeys, TValues | TExtended>>;

    /**
     * Returns the value when key is found otherwise an error will be thrown.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {KeyNotFoundStorageError} {@link KeyNotFoundStorageError}
     */
    getOrFail<TValue extends TType>(key: string): Promise<TValue>;

    /**
     * Adds a key when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    add<TValue extends TType>(
        key: string,
        value: StorageValue<TValue>,
    ): Promise<boolean>;

    /**
     * Adds the keys that doesn't exists. Returns true for the keys that doesn't exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, StorageValue<TValues>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * Updates a keys that exists. Returns true when key otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    update<TValue extends TType>(key: string, value: TValue): Promise<boolean>;

    /**
     * Updates the keys that exists. Returns true for the keys that exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * If the key is found it will replaced. If the key is not found it will just be added. True is returned if the key is found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    put<TValue extends TType>(
        key: string,
        value: StorageValue<TValue>,
    ): Promise<boolean>;

    /**
     * Replaces the keys that are found. Adds keys that are not found. Returns true for all the keys that are found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, StorageValue<TValues>>,
    ): Promise<Record<TKeys, boolean>>;

    /**
     * Removes the key when found. Returns true if the key is found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    remove(key: string): Promise<boolean>;

    /**
     * Removes the keys that are found. Returns true for the keys that are found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>>;

    /**
     * If the key is found the value be returned and key will be removed otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getAndRemove<TValue extends TType>(key: string): Promise<TValue | null>;

    /**
     * If the key is found the value be returned otherwise valueToAdd will be added and returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getOrAdd<TValue extends TType, TExtended extends TType>(
        key: string,
        valueToAdd: AsyncLazyable<StorageValue<GetOrAddValue<TExtended>>>,
    ): Promise<TValue | TExtended>;

    /**
     * Will increment the existing key with value if found otherwise nonthing will occur. Returns true if key exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {TypeStorageError} {@link TypeStorageError}
     */
    increment(key: string, value?: number): Promise<boolean>;

    /**
     * Will decrement the existing key with value if found otherwise nonthing will occur. Returns true if key exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {TypeStorageError} {@link TypeStorageError}
     */
    decrement(key: string, value?: number): Promise<boolean>;

    /**
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    clear(): Promise<void>;
};
