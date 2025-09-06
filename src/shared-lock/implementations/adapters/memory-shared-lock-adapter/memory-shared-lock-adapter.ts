/**
 * @module SharedLock
 */

import type { IDeinitizable, TimeSpan } from "@/utilities/_module-exports.js";
import type {
    ISharedLockAdapter,
    ISharedLockAdapterState,
    SharedLockAcquireSettings,
} from "@/shared-lock/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export type MemorySharedLockData = {};

/**
 * Note the `MemorySharedLockAdapter` is limited to single process usage and cannot be shared across multiple servers or different processes.
 * This adapter is meant to be used for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export class MemorySharedLockAdapter
    implements ISharedLockAdapter, IDeinitizable
{
    /**
     *  @example
     * ```ts
     * import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
     *
     * const lockAdapter = new MemorySharedLockAdapter();
     * ```
     * You can also provide an `Map`.
     * @example
     * ```ts
     * import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
     *
     * const map = new Map<any, any>();
     * const lockAdapter = new MemorySharedLockAdapter(map);
     * ```
     */
    constructor(
        private readonly map = new Map<string, MemorySharedLockData>(),
    ) {}

    deInit(): Promise<void> {
        throw new Error("Method not implemented.");
    }

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

    getState(key: string): Promise<ISharedLockAdapterState | null> {
        throw new Error("Method not implemented.");
    }
}
