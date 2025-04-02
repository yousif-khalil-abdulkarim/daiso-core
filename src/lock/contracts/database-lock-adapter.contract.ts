/**
 * @module Lock
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILockProvider } from "@/lock/contracts/lock-provider.contract.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockData = {
    owner: string;
    expiration: Date | null;
};

/**
 * The `ILockAdapter` contract defines a way for managing locks independent of data storage.
 * This contract is not meant to be used directly, instead you should use {@link ILockProvider | `ILockProvider`} contract.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type IDatabaseLockAdapter = {
    /**
     * The `insert` method will create a lock if one does not already exist.
     */
    insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<void>;

    /**
     * The `update` method will update a lock if it has expired, matches the given `key` and  matches the given `owner`.
     * Returns number of updated rows or documents.
     */
    update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<number>;

    /**
     * The `remove` method will remove a lock if it matches the given `key` and matches the given `owner`.
     */
    remove(key: string, owner: string | null): PromiseLike<void>;

    /**
     * The `refresh` method will upadte expiration of lock if it matches the given `key` and matches the given `owner`.
     * Returns number of updated rows or documents.
     */
    refresh(key: string, owner: string, expiration: Date): PromiseLike<number>;

    /**
     * The `find` method will return a lock by the given `key`.
     */
    find(key: string): PromiseLike<ILockData | null>;
};
