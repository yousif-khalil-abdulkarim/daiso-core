/**
 * @module Semaphore
 */

import type { ISemaphoreAdapterState } from "@/semaphore/contracts/semaphore-adapter.contract.js";
import type { ISemaphoreState } from "@/semaphore/contracts/semaphore-state.contract.js";
import { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class SemaphoreState implements ISemaphoreState {
    constructor(
        private readonly state: ISemaphoreAdapterState,
        private readonly slotId: string,
    ) {}

    isExpired(): boolean {
        const state = this.state;

        const expiration = state.acquiredSlots.get(this.slotId);
        if (expiration === undefined) {
            return true;
        }
        if (expiration === null) {
            return false;
        }
        return expiration <= new Date();
    }

    isAcquired(): boolean {
        const isExpired = this.isExpired();
        return !isExpired;
    }

    getRemainingTime(): TimeSpan | null {
        const expiration = this.state.acquiredSlots.get(this.slotId);
        const hasNotSlot = expiration === undefined;
        if (hasNotSlot) {
            return null;
        }
        const isUnexpireable = expiration === null;
        if (isUnexpireable) {
            return null;
        }
        return TimeSpan.fromDateRange(new Date(), expiration);
    }

    getLimit(): number {
        return this.state.limit;
    }

    freeSlotsCount(): number {
        return this.state.limit - this.state.acquiredSlots.size;
    }

    acquiredSlotsCount(): number {
        return this.state.acquiredSlots.size;
    }

    acquiredSlots(): string[] {
        return [...this.state.acquiredSlots.keys()];
    }
}
