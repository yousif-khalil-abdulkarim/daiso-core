/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    LOCK_REFRESH_RESULT,
    type ILockAdapter,
    type LockRefreshResult,
} from "@/lock/contracts/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILockProvider } from "@/lock/contracts/_module-exports.js";

/**
 * This `NoOpLockAdapter` will do nothing and is used for easily mocking {@link ILockProvider | `ILockProvider`} for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/adapters"`
 * @group Adapters
 */
export class NoOpLockAdapter implements ILockAdapter {
    acquire(
        _key: string,
        _owner: string,
        _ttl: TimeSpan | null,
    ): Promise<boolean> {
        return Promise.resolve(true);
    }

    release(_key: string, _owner: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    forceRelease(_key: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    refresh(
        _key: string,
        _owner: string,
        _ttl: TimeSpan,
    ): Promise<LockRefreshResult> {
        return Promise.resolve(LOCK_REFRESH_RESULT.REFRESHED);
    }
}
