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
} from "@/storage/contracts/_shared";

export type StorageValue<T> = Exclude<T, AnyFunction | undefined | null>;

/**
 * @throws {StorageError} {@link StorageError}
 * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
 * @throws {TypeStorageError} {@link TypeStorageError}
 * @group Contracts
 */
export type IStorage<TType = unknown> = {
    /**
     * Return a new instance of <i>IStorage</i> prefixed with given <i>name</i>
     */
    namespace(name: string): IStorage<TType>;

    /**
     * Returns true when key is found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    exists(key: string): PromiseLike<boolean>;

    /**
     * Returns true for the keys that are found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * Returns true when key is not found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    missing(key: string): PromiseLike<boolean>;

    /**
     * Returns true for the keys that are not found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * Returns the value when key is found otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    get(key: string): PromiseLike<TType | null>;

    /**
     * Returns the value for the keys that are found otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, TType | null>>;

    /**
     * Returns the value when key is found otherwise defaultValue will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getOr(key: string, defaultValue: AsyncLazyable<TType>): PromiseLike<TType>;

    /**
     * Returns the value for the keys that are found otherwise defaultValue will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getOrMany<TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TType>>,
    ): PromiseLike<Record<TKeys, TType>>;

    /**
     * Returns the value when key is found otherwise an error will be thrown.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {KeyNotFoundStorageError} {@link KeyNotFoundStorageError}
     */
    getOrFail(key: string): PromiseLike<TType>;

    /**
     * Adds a key when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    add(key: string, value: StorageValue<TType>): PromiseLike<boolean>;

    /**
     * Adds the keys that doesn't exists. Returns true for the keys that doesn't exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    addMany<TKeys extends string>(
        values: Record<TKeys, StorageValue<TType>>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * Updates a keys that exists. Returns true when key otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    update(key: string, value: TType): PromiseLike<boolean>;

    /**
     * Updates the keys that exists. Returns true for the keys that exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * If the key is found it will replaced. If the key is not found it will just be added. True is returned if the key is found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    put(key: string, value: StorageValue<TType>): PromiseLike<boolean>;

    /**
     * Replaces the keys that are found. Adds keys that are not found. Returns true for all the keys that are found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    putMany<TKeys extends string>(
        values: Record<TKeys, StorageValue<TType>>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * Removes the key when found. Returns true if the key is found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    remove(key: string): PromiseLike<boolean>;

    /**
     * Removes the keys that are found. Returns true for the keys that are found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * If the key is found the value be returned and key will be removed otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getAndRemove(key: string): PromiseLike<TType | null>;

    /**
     * If the key is found the value be returned otherwise valueToAdd will be added and returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getOrAdd(
        key: string,
        valueToAdd: AsyncLazyable<StorageValue<GetOrAddValue<TType>>>,
    ): PromiseLike<TType>;

    /**
     * Will increment the existing key with value if found otherwise nonthing will occur. Returns true if key exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {TypeStorageError} {@link TypeStorageError}
     */
    increment(
        key: string,
        value?: Extract<TType, number>,
    ): PromiseLike<boolean>;

    /**
     * Will decrement the existing key with value if found otherwise nonthing will occur. Returns true if key exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {TypeStorageError} {@link TypeStorageError}
     */
    decrement(
        key: string,
        value?: Extract<TType, number>,
    ): PromiseLike<boolean>;

    /**
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    clear(): PromiseLike<void>;
};
