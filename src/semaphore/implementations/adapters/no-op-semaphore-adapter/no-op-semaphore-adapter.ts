/**
 * @module Semaphore
 */

import type {
    ISemaphoreAdapter,
    ISemaphoreAdapterState,
    SemaphoreAcquireSettings,
} from "@/semaphore/contracts/_module-exports.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ISemaphoreProvider } from "@/semaphore/contracts/_module-exports.js";
import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 * This `NoOpSemaphoreAdapter` will do nothing and is used for easily mocking {@link ISemaphoreProvider | `ISemaphoreProvider`} for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/no-op-semaphore-adapter"`
 * @group Adapters
 */
export class NoOpSemaphoreAdapter implements ISemaphoreAdapter {
    getState(_key: string): Promise<ISemaphoreAdapterState | null> {
        return Promise.resolve({
            limit: Infinity,
            acquiredSlots: new Map(),
        });
    }

    acquire(_settings: SemaphoreAcquireSettings): Promise<boolean> {
        return Promise.resolve(true);
    }

    release(_key: string, _slotId: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    forceReleaseAll(_key: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    refresh(_key: string, _slotId: string, _ttl: TimeSpan): Promise<boolean> {
        return Promise.resolve(true);
    }
}
