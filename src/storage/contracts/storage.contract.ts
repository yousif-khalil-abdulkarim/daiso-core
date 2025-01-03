/**
 * @module Storage
 */

import type { IListenable } from "@/event-bus/contracts/_module";
import {
    type AnyFunction,
    type AsyncLazyable,
    type GetOrAddValue,
} from "@/_shared/types";
import type { AllStorageEvents } from "@/storage/contracts/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type StorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeStorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedStorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type KeyNotFoundStorageError,
} from "@/storage/contracts/_module";

export type StorageValue<T> = Exclude<T, AnyFunction | undefined | null>;

/**
 * The <i>IStorage</i> contract defines a way for storing data as key-value pairs independent of storage.
 * It commes with more convient methods compared to <i>IStorageAdapter</i>.
 * @throws {StorageError} {@link StorageError}
 * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
 * @throws {TypeStorageError} {@link TypeStorageError}
 * @group Contracts
 */
export type IStorage<TType = unknown> = IListenable<AllStorageEvents<TType>> & {
    /**
     * The <i>exists</i> method returns true when <i>key</i> is found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    exists(key: string): PromiseLike<boolean>;

    /**
     * The <i>existsMany</i> method returns true for the <i>keys</i> that are found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>missing</i> method returns true when <i>key</i> is not found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    missing(key: string): PromiseLike<boolean>;

    /**
     * The <i>missingMany</i> method returns true for the <i>keys</i> that are not found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>get</i> method returns the value when <i>key</i> is found otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    get(key: string): PromiseLike<TType | null>;

    /**
     * The <i>getMany</i> returns the value for the <i>keys</i> that are found otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, TType | null>>;

    /**
     * The <i>getOr</i> method returns the value when <i>key</i> is found otherwise <i>defaultValue</i> will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getOr(key: string, defaultValue: AsyncLazyable<TType>): PromiseLike<TType>;

    /**
     * The <i>getOrMany</i> method returns the value for the keys that are found otherwise defaultValue will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getOrMany<TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TType>>,
    ): PromiseLike<Record<TKeys, TType>>;

    /**
     * The <i>getOrFail</i> method returns the value when <i>key</i> is found otherwise an error will be thrown.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {KeyNotFoundStorageError} {@link KeyNotFoundStorageError}
     */
    getOrFail(key: string): PromiseLike<TType>;

    /**
     * The <i>add</i> method adds a <i>key</i> with given <i>value</i> when key doesn't exists. Returns true when key doesn't exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    add(key: string, value: StorageValue<TType>): PromiseLike<boolean>;

    /**
     * The <i>addMany</i> method adds the keys that doesn't exists. Returns true for the keys that doesn't exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    addMany<TKeys extends string>(
        values: Record<TKeys, StorageValue<TType>>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>update</i> method updates the given <i>key</i> with given <i>value</i>. Returns true when key otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    update(key: string, value: TType): PromiseLike<boolean>;

    /**
     * The <i>updateMany</i> method updates the given keys. Returns true for the keys that exists otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>put</i> method replaces the key with given <i>value</i> if found. If the <i>key</i> is not found it will just be added. True is returned if the key is found otherwise false will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    put(key: string, value: StorageValue<TType>): PromiseLike<boolean>;

    /**
     * The <i>putMany</i> method replaces the keys that are found. Adds keys that are not found. Returns true for all the keys that are found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    putMany<TKeys extends string>(
        values: Record<TKeys, StorageValue<TType>>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>remove</i> method removes the given <i>key</i> when found. Returns true if the key is found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    remove(key: string): PromiseLike<boolean>;

    /**
     * The <i>removesMany</i> method removes the keys that are found. Returns true for the keys that are found otherwise false is returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>getAndRemove</i> method removes the given <i>key</i> and returns it when found otherwise null will be returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getAndRemove(key: string): PromiseLike<TType | null>;

    /**
     * The <i>getOrAdd</i> method will retrieve the given <i>key</i> if found otherwise <i>valueToAdd</i> will be added and returned.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    getOrAdd(
        key: string,
        valueToAdd: AsyncLazyable<StorageValue<GetOrAddValue<TType>>>,
    ): PromiseLike<TType>;

    /**
     * The <i>increment</i> method will increment the given <i>key</i> if found otherwise nonthing will occur.
     * Returns true if key exists otherwise false will be returned.
     * An error will thrown if the key is not a number.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {TypeStorageError} {@link TypeStorageError}
     */
    increment(
        key: string,
        value?: Extract<TType, number>,
    ): PromiseLike<boolean>;

    /**
     * The <i>decrement</i> method will decrement the given <i>key</i> if found otherwise nonthing will occur.
     * Returns true if key exists otherwise false will be returned.
     * An error will thrown if the key is not a number.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     * @throws {TypeStorageError} {@link TypeStorageError}
     * An error will thrown if the key is not a number.
     */
    decrement(
        key: string,
        value?: Extract<TType, number>,
    ): PromiseLike<boolean>;

    /**
     * The <i>clear</i> method removes all the keys in the storage.
     * @throws {StorageError} {@link StorageError}
     * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
     */
    clear(): PromiseLike<void>;
};

/**
 * The <i>INamespacedStorage</i> contract defines a way for storing data as key-value pairs independent of storage.
 * It commes with one extra method which is useful for multitennat applications compared to <i>IStorage</i>.
 * @throws {StorageError} {@link StorageError}
 * @throws {UnexpectedStorageError} {@link UnexpectedStorageError}
 * @throws {TypeStorageError} {@link TypeStorageError}
 * @group Contracts
 */
export type INamespacedStorage<TType = unknown> = IStorage<TType> & {
    /**
     * The <i>withNamespace</i> method returns new instance of <i>{@link IStorage}</i> where all the keys will be prefixed with a given <i>namespace</i>.
     * This useful for multitennat applications.
     */
    withNamespace(namespace: string): IStorage<TType>;

    /**
     * The <i>getNamespace</i> method return the complete namespace.
     */
    getNamespace(): string;
};
