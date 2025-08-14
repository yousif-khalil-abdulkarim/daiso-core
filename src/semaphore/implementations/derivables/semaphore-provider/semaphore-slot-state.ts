/**
 * @module Semaphore
 */

import { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export type ISemaphoreStore = Partial<Record<string, Map<string, Date | null>>>;

/**
 * @internal
 */
export type SemaphoreStateSettings = {
    store: ISemaphoreStore;
    key: string;
    limit: number;
    slotId: string;
};

/**
 * @internal
 */
export class SemaphoreSlotState {
    private static isExpired = (expiration: Date | null): boolean => {
        if (expiration === null) {
            return false;
        }
        return expiration < new Date();
    };

    private readonly store: ISemaphoreStore;
    private readonly key: string;
    private readonly limit: number;
    public readonly slotId: string;

    constructor(settings: SemaphoreStateSettings) {
        const { store, key, limit, slotId } = settings;
        this.store = store;
        this.key = key;
        this.limit = limit;
        this.slotId = slotId;
    }

    /**
     * Return the slot expiration as a TimeSpan.
     */
    get(): TimeSpan | null {
        const map = this.store[this.key];
        if (map === undefined) {
            return null;
        }
        const expiration = map.get(this.slotId);
        if (!expiration) {
            return null;
        }
        return TimeSpan.fromDateRange(new Date(), expiration);
    }

    /**
     *
     * Returns all slots ids that are not expired.
     */
    getAllSlotIds(): string[] {
        const slots = this.store[this.key];
        if (slots === undefined) {
            return [];
        }
        const slotIds: string[] = [];
        for (const [slotId, expiration] of slots.entries()) {
            const hasNoExpiration = expiration === null;
            const hasNotExpired =
                expiration !== null && expiration < new Date();
            if (hasNoExpiration || hasNotExpired) {
                slotIds.push(slotId);
            }
        }
        return slotIds;
    }

    /**
     * Sets the slot expiration time.
     */
    set(ttl: TimeSpan | null): void {
        let map = this.store[this.key];
        if (map === undefined) {
            map = new Map();
            this.store[this.key] = map;
        }
        if (map.size >= this.limit) {
            return;
        }
        map.set(this.slotId, ttl?.toEndDate() ?? null);
    }

    /**
     * Removes the slot.
     */
    remove(): void {
        const map = this.store[this.key];
        if (map === undefined) {
            return;
        }
        map.delete(this.slotId);
        if (map.size === 0) {
            this.removeAll();
        }
    }

    /**
     * Removes all slots related to the this slot with same key
     */
    removeAll(): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.store[this.key];
    }

    /**
     * Checks if the slot is expired.
     */
    isExpired(): boolean {
        const map = this.store[this.key];
        if (map === undefined) {
            return true;
        }
        const expiration = map.get(this.slotId);
        if (expiration === undefined) {
            return true;
        }
        if (expiration === null) {
            return false;
        }
        return SemaphoreSlotState.isExpired(expiration);
    }

    /**
     * Return all number of free slots.
     */
    availableSlots(): number {
        const map = this.store[this.key];
        if (map === undefined) {
            return this.limit;
        }
        return this.limit - map.size;
    }
}
