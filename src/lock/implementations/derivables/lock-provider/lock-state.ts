/**
 * @module Lock
 */

import type { ILockAdapterState } from "@/lock/contracts/lock-adapter.contract.js";
import type { ILockState } from "@/lock/contracts/lock-state.contract.js";
import { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class LockState implements ILockState {
    constructor(
        private readonly state: ILockAdapterState,
        private readonly lockId: string,
    ) {}

    isExpired(): boolean {
        return this.state.owner !== this.lockId;
    }

    isAcquired(): boolean {
        return this.state.owner === this.lockId;
    }

    getRemainingTime(): TimeSpan | null {
        if (this.state.expiration === null) {
            return null;
        }
        return TimeSpan.fromDateRange(new Date(), this.state.expiration);
    }

    getOwner(): string {
        return this.state.owner;
    }
}
