/**
 * @module SharedLock
 */

import type { IDatabaseSharedLockAdapter } from "@/shared-lock/contracts/_module-exports.js";
import type {
    ISharedLockAdapter,
    ISharedLockAdapterState,
    SharedLockAcquireSettings,
} from "@/shared-lock/contracts/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export class DatabaseSharedLockAdapter implements ISharedLockAdapter {
    constructor(private readonly adapter: IDatabaseSharedLockAdapter) {}

    acquireWriter(
        key: string,
        lockId: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    releaseWriter(key: string, lockId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forceReleaseWriter(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    refreshWriter(
        key: string,
        lockId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    acquireReader(settings: SharedLockAcquireSettings): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    releaseReader(key: string, slotId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forceReleaseAllReaders(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    refreshReader(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    forceRelease(key: string, slotId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    getState(key: string): Promise<ISharedLockAdapterState | null> {
        throw new Error("Method not implemented.");
    }
}
