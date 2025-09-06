/**
 * @module SharedLock
 */

import type {
    ISemaphoreAdapter,
    ISemaphoreAdapterState,
    SemaphoreAcquireSettings,
} from "@/semaphore/contracts/semaphore-adapter.contract.js";
import type { ISharedLockAdapter } from "@/shared-lock/contracts/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { SharedLockAdapterVariants } from "@/shared-lock/contracts/_module-exports.js";
import { resolveDatabaseSharedLockAdapter } from "@/shared-lock/implementations/derivables/shared-lock-provider/resolve-database-shared-lock-adapter.js";

/**
 * Converts a {@link ISharedLockAdapter | `ISharedLockAdapter`} to  {@link ISemaphoreAdapter | `ISemaphoreAdapter`}.
 *
 * @group Helpers
 */
export class ToSemaphoreAdapter implements ISemaphoreAdapter {
    private readonly adapter: ISharedLockAdapter;

    constructor(adapter: SharedLockAdapterVariants) {
        this.adapter = resolveDatabaseSharedLockAdapter(adapter);
    }

    async acquire(settings: SemaphoreAcquireSettings): Promise<boolean> {
        return await this.adapter.acquireReader({
            ...settings,
            lockId: settings.slotId,
        });
    }

    async release(key: string, slotId: string): Promise<boolean> {
        return await this.adapter.releaseReader(key, slotId);
    }

    async forceReleaseAll(key: string): Promise<boolean> {
        return await this.adapter.forceReleaseAllReaders(key);
    }

    async refresh(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        return await this.adapter.refreshReader(key, slotId, ttl);
    }

    async getState(key: string): Promise<ISemaphoreAdapterState | null> {
        const state = await this.adapter.getState(key);
        if (state === null) {
            return null;
        }
        return state.reader;
    }
}
