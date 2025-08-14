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
    slots: Map<string, string | number | NodeJS.Timeout | null>;
};

/**
 * Note the `MemorySemaphoreAdapter` is limited to single process usage and cannot be shared across multiple servers or different processes.
 * This adapter is meant to be used for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export class MemorySemaphoreAdapter implements ISemaphoreAdapter {
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
                slots: new Map(),
            };
            this.map.set(key, semaphore);
        }

        if (semaphore.slots.size >= semaphore.limit) {
            return false;
        }

        if (semaphore.slots.has(slotId)) {
            return false;
        }

        if (ttl) {
            const timeoutId = setTimeout(() => {
                semaphore.slots.delete(slotId);
            }, ttl.toMilliseconds());

            semaphore.slots.set(slotId, timeoutId);
        } else {
            semaphore.slots.set(slotId, null);
        }

        this.map.set(key, semaphore);

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async release(key: string, slotId: string): Promise<boolean> {
        const semaphore = this.map.get(key);
        if (!semaphore) {
            return false;
        }

        const slot = semaphore.slots.get(slotId);
        if (slot === undefined) {
            return false;
        }

        if (slot !== null) {
            clearTimeout(slot);
        }

        semaphore.slots.delete(slotId);
        this.map.set(key, semaphore);

        if (semaphore.slots.size === 0) {
            this.map.delete(key);
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async forceReleaseAll(key: string): Promise<boolean> {
        const semaphore = this.map.get(key);
        if (semaphore === undefined) {
            return false;
        }
        const hasSlots = semaphore.slots.size > 0;
        for (const [slotId, timeoutId] of semaphore.slots) {
            clearTimeout(timeoutId ?? undefined);
            semaphore.slots.delete(slotId);
        }
        this.map.delete(key);
        return hasSlots;
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
        const slot = semaphore.slots.get(slotId);
        if (slot === undefined) {
            return false;
        }
        if (slot === null) {
            return false;
        }

        clearTimeout(slot);
        const timeoutId = setTimeout(() => {
            semaphore.slots.delete(slotId);
            this.map.set(key, semaphore);
        }, ttl.toMilliseconds());

        semaphore.slots.set(slotId, timeoutId);
        this.map.set(key, semaphore);

        return true;
    }
}
