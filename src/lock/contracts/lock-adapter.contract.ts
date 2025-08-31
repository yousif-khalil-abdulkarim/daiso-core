/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILockProvider } from "@/lock/contracts/lock-provider.contract.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockAdapterState = {
    owner: string;
    expiration: Date | null;
};

/**
 * The `ILockAdapter` contract defines a way for managing locks independent of the underlying technology.
 * This contract is not meant to be used directly, instead you should use {@link ILockProvider | `ILockProvider`} contract.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockAdapter = {
    /**
     * The `acquire` method acquires a lock only if expired.
     *
     * @returns Returns `true` if expired otherwise `false` is returned.
     */
    acquire(
        key: string,
        lockId: string,
        ttl: TimeSpan | null,
    ): Promise<boolean>;

    /**
     * The `release` method releases a lock if the owner matches.
     *
     * @returns Returns `true` if released otherwise `false` is returned.
     */
    release(key: string, lockId: string): Promise<boolean>;

    /**
     * The `forceRelease` method releases a lock regardless of the owner.
     *
     * @returns Returns `true` if the lock exists or `false` if the lock is expired.
     */
    forceRelease(key: string): Promise<boolean>;

    /**
     * The `refresh` method will upadte `ttl` of lock if it matches the `owner` and is expireable.
     *
     * @returns Returns `false` if the lock is unexpireable, the is expired, does not match the `owner` otherwise `true` is returned.
     */
    refresh(key: string, lockId: string, ttl: TimeSpan): Promise<boolean>;

    getState(key: string): Promise<ILockAdapterState | null>;
};
