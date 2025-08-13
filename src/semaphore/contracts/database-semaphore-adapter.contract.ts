/**
 * @module Semaphore
 */

import type { InvokableFn } from "@/utilities/_module-exports.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreSlotExpirationData = {
    /**
     * The expiration date and time of the lock.
     * `null` indicates the lock does not expire.
     */
    expiration: Date | null;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreSlotData = ISemaphoreSlotExpirationData & {
    id: string;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreData = {
    limit: number;
};

/**
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type IDatabaseSemaphoreTransaction = {
    /**
     * The `findSemaphore` returns the semaphore if it exists otherwise `null` is returned.
     */
    findSemaphore(key: string): Promise<ISemaphoreData | null>;

    /**
     * The `findSlots` returns the semaphore slot if it exists otherwise `null` is returned.
     *
     */
    findSlots(key: string): Promise<ISemaphoreSlotData[]>;

    /**
     * The `upsertSemaphore` inserts a semaphore if it doesnt exist otherwise it will be updated.
     *
     */
    upsertSemaphore(key: string, limit: number): Promise<void>;

    /**
     * The `upsertSlot` inserts a semaphore slot if it doesnt exist otherwise it will be updated.
     *
     */
    upsertSlot(
        key: string,
        slotId: string,
        expiration: Date | null,
    ): Promise<void>;
};

/**
 * The `IDatabaseSemaphoreAdapter` contract defines a way for managing semaphores independent of data storage.
 * This contract simplifies the implementation of semaphore adapters with CRUD-based databases, such as SQL databases and ORMs like TypeOrm and MikroOrm.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type IDatabaseSemaphoreAdapter = {
    /**
     * The `transaction` method runs the `fn` function inside a transaction.
     * The `fn` function is given a {@link IDatabaseSemaphoreTransaction | `IDatabaseSemaphoreTransaction`} object.
     */
    transaction<TValue>(
        fn: InvokableFn<
            [methods: IDatabaseSemaphoreTransaction],
            Promise<TValue>
        >,
    ): Promise<TValue>;

    /**
     * The `removeSlot` removes the specified slot.
     *
     * @returns Returns the slot expiration.
     */
    removeSlot(
        key: string,
        slotId: string,
    ): Promise<ISemaphoreSlotExpirationData | null>;

    /**
     * The `removeAllSlots` removes all slots of the given semaphore.
     *
     * @returns Returns the slot expiration.
     */
    removeAllSlots(key: string): Promise<ISemaphoreSlotExpirationData[]>;

    /**
     * The `updateExpiration` updates the specified slot expiration as long as it is expireable and unexpired of the given semaphore.
     *
     * @returns Returns a number greater than 0 if the slot expiration was updated, otherwise returns 0.
     */
    updateExpiration(
        key: string,
        slotId: string,
        expiration: Date,
    ): Promise<number>;
};
