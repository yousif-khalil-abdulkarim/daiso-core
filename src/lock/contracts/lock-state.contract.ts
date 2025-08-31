/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockState = {
    /**
     * The `isExpired` method returns true if the lock is expired or not acquired otherwise false is returned.
     */
    isExpired(): boolean;

    /**
     * The `isAcquired` method returns true if the lock has been aquired and is unexpirable or unexpired otherwise false is returned.
     */
    isAcquired(): boolean;

    /**
     * The `getRemainingTime` return the reaming time as {@link TimeSpan | `TimeSpan`}.
     *
     * @returns Returns null if the key doesnt exist, key has no expiration and key has expired.
     */
    getRemainingTime(): TimeSpan | null;

    /**
     * The `getOwner` method return the current owner of the lock.
     */
    getOwner(): string;
};
