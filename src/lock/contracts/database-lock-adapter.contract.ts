/**
 * @module Lock
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILockProvider } from "@/lock/contracts/lock-provider.contract.js";

/**
 * @group Contracts
 */
export type ILockData = {
    owner: string;
    expiration: Date | null;
};

/**
 * The <i>ILockAdapter</i> contract defines a way for managing locks independent of data storage.
 * This contract is not meant to be used directly, instead you should use <i>{@link ILockProvider}</i> contract.
 * @group Contracts
 */
export type IDatabaseLockAdapter = {
    /**
     * The <i>insert</i> method will create a lock if one does not already exist.
     */
    insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<void>;

    /**
     * The <i>update</i> method will update a lock if it has expired, matches the given <i>key</i> and  matches the given <i>owner</i>.
     * Returns number of updated rows or documents.
     */
    update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<number>;

    /**
     * The <i>remove</i> method will remove a lock if it matches the given <i>key</i> and matches the given <i>owner</i>.
     */
    remove(key: string, owner: string | null): PromiseLike<void>;

    /**
     * The <i>refresh</i> method will upadte expiration of lock if it matches the given <i>key</i> and matches the given <i>owner</i>.
     * Returns number of updated rows or documents.
     */
    refresh(key: string, owner: string, expiration: Date): PromiseLike<number>;

    /**
     * The <i>find</i> method will return a lock by the given <i>key</i>.
     */
    find(key: string): PromiseLike<ILockData | null>;

    /**
     * The <i>getGroup</i> method returns the group name.
     */
    getGroup(): string;

    /**
     * The <i>withGroup</i> method returns a new <i>{@link IDatabaseLockAdapter}</i> instance that groups locks together.
     * Only locks in the same group will be acquired and released, leaving locks outside the group unaffected.
     */
    withGroup(group: string): IDatabaseLockAdapter;
};
