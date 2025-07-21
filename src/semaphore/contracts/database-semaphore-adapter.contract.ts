/**
 * @module Semaphore
 */

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type DatabaseSemaphoreInsertSlotSettings = {
    key: string;
    slotId: string;
    limit: number;
    expiration: Date | null;
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
     * The `findLimit` method returns the semaphore limit.
     *
     * @returns Returns the limit if it exists and if doesnt exists null is returned.
     */
    findLimit(key: string): Promise<number | null>;

    /**
     * The `insertSemaphore` method creates a seampahore if it does not exist and if the seampahore already exists an error must be thrown.
     */
    insertSemaphore(key: string, limit: number): Promise<void>;

    /**
     * The `removeSemaphore` method removes the semaphore and all related slots.
     */
    removeSemaphore(key: string): Promise<void>;

    /**
     * The `insertSlotIfLimitNotReached` should only insert a slot if limit is not reached.
     * An error should be thrown if key doesnt exist.
     *
     * @returns Returns Amount of inserted rows.
     */
    insertSlotIfLimitNotReached(
        settings: DatabaseSemaphoreInsertSlotSettings,
    ): Promise<number>;

    /**
     * The `removeSlot` method removes a slot.
     */
    removeSlot(key: string, slotId: string): Promise<void>;

    /**
     * The `updateSlotIfUnexpired` method updates a slot if not expired.
     *
     * @returns Returns Amount of updated rows.
     */
    updateSlotIfUnexpired(
        key: string,
        slotId: string,
        expiration: Date,
    ): Promise<number>;
};
