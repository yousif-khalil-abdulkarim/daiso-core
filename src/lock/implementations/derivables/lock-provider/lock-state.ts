/**
 * @module Lock
 */

import { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export type ILockStateData = {
    expiration: Date | null;
};

/**
 * @internal
 */
export type ILockStateRecord = Partial<Record<string, ILockStateData>>;

/**
 * @internal
 */
export class LockState {
    constructor(
        private stateRecord: ILockStateRecord,
        private readonly key: string,
    ) {}

    /**
     * Return the expiration as a date.
     */
    get(): Date | null {
        const state = this.stateRecord[this.key];
        if (state === undefined) {
            return null;
        }
        const { expiration } = state;
        return expiration;
    }

    /**
     * Sets the expiration time.
     * If a number is provided, it must be in milliseconds.
     */
    set(ttl: TimeSpan | number | null): void {
        if (typeof ttl === "number") {
            this.stateRecord[this.key] = {
                expiration: new Date(ttl),
            };
            return;
        }
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
     * Returns the remaining time.
     */
    getRemainingTime(): TimeSpan | null {
        const state = this.stateRecord[this.key];
        if (state === undefined) {
            return null;
        }
        const { expiration } = state;
        if (expiration === null) {
            return null;
        }
        return TimeSpan.fromDateRange(new Date(), expiration);
    }

    /**
     * Removes the expiration from the record.
     */
    remove(): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.stateRecord[this.key];
    }
}
