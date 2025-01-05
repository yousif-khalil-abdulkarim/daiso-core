/**
 * @module Storage
 */

import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeStorageError,
} from "@/storage/contracts/_shared";

/**
 * The <i>IStorageAdapter</i> contract defines a way for storing data as key-value pairs independent of storage.
 * This interface is not meant to be used directly, instead you should use <i>IStorage</i>
 * @group Contracts
 */
export type IStorageAdapter<TType = unknown> = {
    /**
     * The <i>getMany</i> returns the value for the <i>keys</i> that are found otherwise null will be returned.
     */
    getMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, TType | null>>;

    /**
     * The <i>addMany</i> method adds the keys that doesn't exists. Returns true for the keys that doesn't exists otherwise false will be returned.
     */
    addMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>updateMany</i> method updates the given keys. Returns true for the keys that exists otherwise false will be returned.
     */
    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>putMany</i> method replaces the keys that are found. Adds keys that are not found. Returns true for all the keys that are found otherwise false is returned.
     */
    putMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>removesMany</i> method removes the keys that are found. Returns true for the keys that are found otherwise false is returned.
     */
    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): PromiseLike<Record<TKeys, boolean>>;

    /**
     * The <i>increment</i> method will increment the given <i>key</i> if found otherwise nonthing will occur.
     * Returns true if key exists otherwise false will be returned.
     * An error will thrown if the key is not a number.
     * @throws {TypeStorageError} {@link TypeStorageError}
     */
    increment(key: string, value: number): PromiseLike<boolean>;

    /**
     * The <i>clear</i> method removes all keys that starts <i>prefix</i>.
     */
    clear(prefix: string): PromiseLike<void>;
};
