/**
 * @module Semaphore
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ISemaphoreProvider } from "@/semaphore/contracts/semaphore-provider.contract.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type SemaphoreAcquireSettings = {
    key: string;
    slotId: string;
    limit: number;
    ttl: TimeSpan | null;
};

/**
 * The `ISemaphoreAdapter` contract defines a way for managing semaphores independent of the underlying technology.
 * This contract is not meant to be used directly, instead you should use {@link ISemaphoreProvider | `ISemaphoreProvider`} contract.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreAdapter = {
    /**
     * The `acquire` method acquires a slot only if the slot limit is not reached.
     *
     * @returns Returns true if the slot limit is not reached otherwise false is returned.
     */
    acquire(settings: SemaphoreAcquireSettings): Promise<boolean>;

    /**
     * The `release` method releases given slot related to the key.
     */
    release(key: string, slotId: string): Promise<void>;

    /**
     * The `forceReleaseAll` method releases all slots related to the key.
     */
    forceReleaseAll(key: string): Promise<void>;

    /**
     * The `refresh` method expiration of slot if not already expired.
     *
     * @returns Returns true if the slot is refreshed* otherwise false is returned.
     */
    refresh(key: string, slotId: string, ttl: TimeSpan): Promise<boolean>;
};
