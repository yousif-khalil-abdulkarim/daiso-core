/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILockProvider } from "@/lock/contracts/lock-provider.contract";

/**
 * The <i>ILockAdapter</i> contract defines a way for managing locks independent of the underlying technology.
 * This contract is not meant to be used directly, instead you should use <i>{@link ILockProvider}</i> contract.
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
     * The <i>isLocked</i> method return true if locked otherwise false is returned.
     */
    isLocked(key: string): PromiseLike<boolean>;

    /**
     * The <i>getRemainingTime</i> return the reaming time as <i>{@link TimeSpan}</i>.
     * Returns null if the key doesnt exist, key has no expiration and key has expired.
     */
    getRemainingTime(key: string): PromiseLike<TimeSpan | null>;

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
