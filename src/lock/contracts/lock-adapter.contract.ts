/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILockProvider } from "@/lock/contracts/lock-provider.contract.js";

/**
 * The `ILockAdapter` contract defines a way for managing locks independent of the underlying technology.
 * This contract is not meant to be used directly, instead you should use {@link ILockProvider | `ILockProvider`} contract.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockAdapter = {
    /**
     * The `acquire` method acquires a lock only if the lock is not already acquired.
     *
     * @returns Returns true if not already acquired othewise false is returned.
     */
    acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): PromiseLike<boolean>;

    /**
     * The `release` method releases a lock if the owner matches.
     *
     * @returns Returns true if released otherwise false is returned.
     */
    release(key: string, owner: string): PromiseLike<boolean>;

    /**
     * The `forceRelease` method releases a lock regardless of the owner.
     */
    forceRelease(key: string): PromiseLike<void>;

    /**
     * The `refresh` method will upadte `ttl` of lock if it matches the given `key` and matches the given `owner`.
     * Returns true if the update occured otherwise false is returned.
     */
    refresh(key: string, owner: string, ttl: TimeSpan): PromiseLike<boolean>;
};
