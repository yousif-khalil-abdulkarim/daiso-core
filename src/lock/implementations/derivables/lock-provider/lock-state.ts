/**
 * @module Lock
 */

import { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export type ILockState = {
    expiration: Date | null;
};

/**
 * @internal
 */
export type ILockStore = Partial<Record<string, ILockState>>;

/**
 * Keeps track of lock states in memory
 *
 * @internal
 */
export class LockState {
    constructor(
        private readonly stateRecord: ILockStore,
        private readonly key: string,
    ) {}

    /**
     * Return the expiration as a TimeSpan.
     */
    get(): TimeSpan | null {
        const state = this.stateRecord[this.key];
        if (state === undefined) {
            return null;
        }
        if (state.expiration === null) {
            return null;
        }
        return TimeSpan.fromDateRange(new Date(), state.expiration);
    }

    /**
     * Sets the key expiration time.
     */
    set(ttl: TimeSpan | null): void {
        this.stateRecord[this.key] = {
            expiration: ttl?.toEndDate() ?? null,
        };
    }

    /**
     * Checks if the key is expired.
     */
    isExpired(): boolean {
        const state = this.stateRecord[this.key];
        if (state === undefined) {
            return true;
        }
        const { expiration } = state;
        if (expiration === null) {
            return false;
        }
        return expiration.getTime() < Date.now();
    }

    /**
     * Removes the key.
     */
    remove(): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.stateRecord[this.key];
    }
}
