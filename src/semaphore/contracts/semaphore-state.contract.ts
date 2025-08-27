import type { TimeSpan } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreState = {
    /**
     * The `isExpired` method returns true if the slot is expired otherwise false is returned.
     *
     */
    isExpired(): boolean;

    /**
     * The `isAcquired` method returns true if the slot is in use otherwise false is returned.
     *
     */
    isAcquired(): boolean;

    /**
     * The `getRemainingTime` return the reaming time as {@link TimeSpan | `TimeSpan`}.
     *
     * @returns Returns null if slot doesnt exist, if the slot has expired and key has no expiration.
     */
    getRemainingTime(): TimeSpan | null;

    /**
     * The `getLimit` method returns a number of slots or `null` if the has not been acquired and therby doesnt exists in the database.
     *
     */
    getLimit(): number;

    /**
     * The `freeSlotsCount` method returns amount of free slots.
     *
     */
    freeSlotsCount(): number;

    /**
     * The `acquiredSlotsCount` method returns amount of currently acquired slots.
     *
     */
    acquiredSlotsCount(): number;

    /**
     * The `acquiredSlotsCount` method returns the ids of acquired slots.
     *
     */
    acquiredSlots(): string[];
};
