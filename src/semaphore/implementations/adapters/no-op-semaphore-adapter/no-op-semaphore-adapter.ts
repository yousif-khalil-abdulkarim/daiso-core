/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @module Semaphore
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import type {
    ISemaphoreAdapter,
    SemaphoreAcquireSettings,
} from "@/semaphore/contracts/_module-exports.js";
import type { ISemaphoreProvider } from "@/semaphore/contracts/_module-exports.js";

/**
 * This `NoOpSemaphoreAdapter` will do nothing and is used for easily mocking {@link ISemaphoreProvider | `ISemaphoreProvider`} for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export class NoOpSemaphoreAdapter implements ISemaphoreAdapter {
    async acquire(_settings: SemaphoreAcquireSettings): Promise<boolean> {
        return true;
    }

    async release(_key: string, _slotId: string): Promise<void> {}

    async forceReleaseAll(_key: string): Promise<void> {}

    async refresh(
        _key: string,
        _slotId: string,
        _ttl: TimeSpan,
    ): Promise<boolean> {
        return true;
    }
}
