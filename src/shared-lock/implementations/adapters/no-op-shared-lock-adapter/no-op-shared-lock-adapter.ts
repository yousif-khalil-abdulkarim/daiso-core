/**
 * @module SharedLock
 */

import type {
    ISharedLockAdapter,
    ISharedLockAdapterState,
    SharedLockAcquireSettings,
} from "@/shared-lock/contracts/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ISharedLockProvider } from "@/shared-lock/contracts/_module-exports.js";
import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 * This `NoOpSharedLockAdapter` will do nothing and is used for easily mocking {@link ISharedLockProvider | `ISharedLockProvider`} for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export class NoOpSharedLockAdapter implements ISharedLockAdapter {
    acquireWriter(
        _key: string,
        _lockId: string,
        _ttl: TimeSpan | null,
    ): Promise<boolean> {
        return Promise.resolve(true);
    }

    releaseWriter(_key: string, _lockId: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    forceReleaseWriter(_key: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    refreshWriter(
        _key: string,
        _lockId: string,
        _ttl: TimeSpan,
    ): Promise<boolean> {
        return Promise.resolve(true);
    }

    acquireReader(_settings: SharedLockAcquireSettings): Promise<boolean> {
        return Promise.resolve(true);
    }

    releaseReader(_key: string, _lockId: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    forceReleaseAllReaders(_key: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    refreshReader(
        _key: string,
        _lockId: string,
        _ttl: TimeSpan,
    ): Promise<boolean> {
        return Promise.resolve(true);
    }

    forceRelease(_key: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    getState(_key: string): Promise<ISharedLockAdapterState | null> {
        return Promise.resolve(null);
    }
}
