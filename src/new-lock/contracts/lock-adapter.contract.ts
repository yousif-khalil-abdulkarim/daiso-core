/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILockProvider } from "@/new-lock/contracts/lock-provider.contract.js";

/**
 * The <i>ILockAdapter</i> contract defines a way for managing locks independent of the underlying technology.
 * This contract is not meant to be used directly, instead you should use <i>{@link ILockProvider}</i> contract.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Contracts
 */
export type ILockAdapter = {
    /**
     * The <i>acquire</i> method acquires a lock only if the lock is not already acquired.
     * Returns true if not already acquired othewise false is returned.
     */
    acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): PromiseLike<boolean>;

    /**
     * The <i>release</i> method releases a lock if the owner matches.
     * Returns true if released otherwise false is returned.
     */
    release(key: string, owner: string): PromiseLike<boolean>;

    /**
     * The <i>forceRelease</i> method releases a lock regardless of the owner.
     */
    forceRelease(key: string): PromiseLike<void>;

    /**
     * The <i>refresh</i> method will upadte ttl of lock if it matches the given <i>key</i> and matches the given <i>owner</i>.
     * Returns true if the update occured otherwise false is returned.
     */
    refresh(key: string, owner: string, ttl: TimeSpan): PromiseLike<boolean>;

    /**
     * The <i>getGroup</i> method returns the group name.
     */
    getGroup(): string;

    /**
     * The <i>withGroup</i> method returns a new <i>{@link IDatabaseLockAdapter}</i> instance that groups locks together.
     * Only locks in the same group will be acquired and released, leaving locks outside the group unaffected.
     */
    withGroup(group: string): ILockAdapter;
};
