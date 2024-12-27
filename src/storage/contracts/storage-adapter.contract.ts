/**
 * @module Storage
 */

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type StorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeStorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedStorageError,
} from "@/storage/contracts/_shared";

/**
 * @throws {StorageError} {@link StorageError}
 * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
 * @throws {TypeStorageError} {@link TypeStorageError}
 * @group Contracts
 */
export type IStorageAdapter<TType> = {
    /**
     * Returns the value for the keys that are found otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getMany<TValues extends TType, TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, TValues | null>>;

    /**
     * Adds the keys that doesn't exists. Returns true for the keys that doesn't exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    addMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * Updates the keys that exists. Returns true for the keys that exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    updateMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * Replaces the keys that are found. Adds keys that are not found. Returns true for all the keys that are found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    putMany<TValues extends TType, TKeys extends string>(
        values: Record<TKeys, TValues>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * Removes the keys that are found. Returns true for the keys that are found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * Will increment the existing key with value if found otherwise nonthing occurs. Returns true if key exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {TypeStorageError} {@link TypeStorageError}
     */
    increment(key: string, value: number): PromiseLike<boolean>;

    /**
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    clear(prefix: string): PromiseLike<void>;
};
