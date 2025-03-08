/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { ILockAdapter } from "@/lock/contracts/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ILockProvider } from "@/lock/contracts/_module-exports.js";

/**
 * This <i>NoOpLockAdapter</i> will do nothing and is used for easily mocking <i>{@link ILockProvider}</i> for testing.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/adapters"```
 * @group Adapters
 */
export class NoOpLockAdapter implements ILockAdapter {
    acquire(
        _key: string,
        _owner: string,
        _ttl: TimeSpan | null,
    ): PromiseLike<boolean> {
        return Promise.resolve(true);
    }

    release(_key: string, _owner: string): PromiseLike<boolean> {
        return Promise.resolve(true);
    }

    forceRelease(_key: string): PromiseLike<void> {
        return Promise.resolve();
    }

    refresh(
        _key: string,
        _owner: string,
        _ttl: TimeSpan,
    ): PromiseLike<boolean> {
        return Promise.resolve(true);
    }
}
