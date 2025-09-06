/**
 * @module SharedLock
 */

import type {
    ILockAdapter,
    ILockAdapterState,
} from "@/lock/contracts/lock-adapter.contract.js";
import type { ISharedLockAdapter } from "@/shared-lock/contracts/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { SharedLockAdapterVariants } from "@/shared-lock/contracts/_module-exports.js";
import { resolveDatabaseSharedLockAdapter } from "@/shared-lock/implementations/derivables/shared-lock-provider/resolve-database-shared-lock-adapter.js";

/**
 * Converts a {@link ISharedLockAdapter | `ISharedLockAdapter`} to  {@link ISharedLockAdapter | `ISharedLockAdapter`}.
 *
 * @group Helpers
 */
export class ToLockAdapter implements ILockAdapter {
    private readonly adapter: ISharedLockAdapter;

    constructor(adapter: SharedLockAdapterVariants) {
        this.adapter = resolveDatabaseSharedLockAdapter(adapter);
    }

    async acquire(
        key: string,
        lockId: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        return await this.adapter.acquireWriter(key, lockId, ttl);
    }

    async release(key: string, slotId: string): Promise<boolean> {
        return await this.adapter.releaseWriter(key, slotId);
    }

    async forceRelease(key: string): Promise<boolean> {
        return await this.adapter.forceReleaseWriter(key);
    }

    async refresh(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        return await this.adapter.refreshWriter(key, slotId, ttl);
    }

    async getState(key: string): Promise<ILockAdapterState | null> {
        const state = await this.adapter.getState(key);
        if (state === null) {
            return null;
        }
        return state.writer;
    }
}
