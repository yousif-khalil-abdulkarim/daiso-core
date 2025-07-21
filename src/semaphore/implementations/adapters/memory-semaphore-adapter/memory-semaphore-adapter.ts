/**
 * @module Semaphore
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import type {
    ISemaphoreAdapter,
    SemaphoreAcquireSettings,
} from "@/semaphore/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type MemorySemaphoreAdapterData = {
    limit: number;
    slots: Set<string>;
};

/**
 * Note the `MemorySemaphoreAdapter` is limited to single process usage and cannot be shared across multiple servers or different processes.
 * This adapter is meant to be used for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export class MemorySemaphoreAdapter implements ISemaphoreAdapter {
    private readonly timeoutMap = new Map<
        string,
        NodeJS.Timeout | string | number
    >();

    /**
     *  @example
     * ```ts
     * import { MemorySemaphoreAdapter } from "@daiso-tech/core/semaphore/adapters";
     *
     * const semaphoreAdapter = new MemorySemaphoreAdapter();
     * ```
     * You can also provide an `Map`.
     * @example
     * ```ts
     * import { MemorySemaphoreAdapter } from "@daiso-tech/core/semaphore/adapters";
     *
     * const map = new Map<any, any>();
     * const semaphoreAdapter = new MemorySemaphoreAdapter(map);
     * ```
     */
    constructor(
        private readonly map = new Map<string, MemorySemaphoreAdapterData>(),
    ) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    async acquire(settings: SemaphoreAcquireSettings): Promise<boolean> {
        const { key, slotId, limit, ttl } = settings;
        let semaphore = this.map.get(key);
        if (semaphore === undefined) {
            semaphore = {
                limit,
                slots: new Set(),
            };
            this.map.set(key, semaphore);
        }
        if (semaphore.slots.size >= semaphore.limit) {
            return false;
        }

        semaphore.slots.add(slotId);
        this.map.set(key, semaphore);
        if (ttl) {
            const timeoutId = setTimeout(() => {
                semaphore.slots.delete(slotId);
                this.timeoutMap.delete(slotId);
            }, ttl.toMilliseconds());
            this.timeoutMap.set(slotId, timeoutId);
        }
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async release(key: string, slotId: string): Promise<void> {
        const semaphore = this.map.get(key);
        if (!semaphore) {
            return;
        }
        semaphore.slots.delete(slotId);
        clearTimeout(this.timeoutMap.get(slotId));
        this.timeoutMap.delete(slotId);
        this.map.set(key, semaphore);

        if (semaphore.slots.size === 0) {
            this.map.delete(key);
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async forceReleaseAll(key: string): Promise<void> {
        const map = this.map.get(key);
        if (map === undefined) {
            return;
        }
        for (const slotId of map.slots) {
            clearTimeout(this.timeoutMap.get(slotId));
            this.timeoutMap.delete(slotId);
        }
        this.map.delete(key);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async refresh(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        const semaphore = this.map.get(key);
        if (!semaphore) {
            return false;
        }
        if (!semaphore.slots.has(slotId)) {
            return false;
        }
        clearTimeout(this.timeoutMap.get(slotId));

        const timeoutId = setTimeout(() => {
            semaphore.slots.delete(slotId);
            this.timeoutMap.delete(slotId);
        }, ttl.toMilliseconds());
        this.timeoutMap.set(slotId, timeoutId);

        return true;
    }
}
