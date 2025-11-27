/**
 * @module SharedLock
 */

import {
    UnexpectedError,
    type IDeinitizable,
} from "@/utilities/_module-exports.js";
import type {
    ISharedLockAdapter,
    ISharedLockAdapterState,
    SharedLockAcquireSettings,
} from "@/shared-lock/contracts/_module-exports.js";
import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/memory-shared-lock-adapter"`
 * @group Adapters
 */
export type MemorySharedWriterLockData =
    | {
          owner: string;
          hasExpiration: true;
          timeoutId: string | number | NodeJS.Timeout;
          expiration: Date;
      }
    | {
          owner: string;
          hasExpiration: false;
      };

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/memory-shared-lock-adapter"`
 * @group Adapters
 */
export type MemorySharedReaderSemaphoreData = {
    limit: number;
    slots: Map<
        string,
        {
            timeoutId: string | number | NodeJS.Timeout | null;
            expiration: Date | null;
        }
    >;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/memory-shared-lock-adapter"`
 * @group Adapters
 */
export type MemorySharedLockData = {
    writerLock: MemorySharedWriterLockData | null;
    readerSemaphore: MemorySharedReaderSemaphoreData | null;
};

/**
 * Note the `MemorySharedLockAdapter` is limited to single process usage and cannot be shared across multiple servers or different processes.
 * This adapter is meant for testing.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/memory-shared-lock-adapter"`
 * @group Adapters
 */
export class MemorySharedLockAdapter
    implements ISharedLockAdapter, IDeinitizable
{
    /**
     *  @example
     * ```ts
     * import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/memory-shared-lock-adapter";
     *
     * const sharedLockAdapter = new MemorySharedLockAdapter();
     * ```
     * You can also provide an `Map`.
     * @example
     * ```ts
     * import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/memory-shared-lock-adapter";
     *
     * const map = new Map<any, any>();
     * const sharedLockAdapter = new MemorySharedLockAdapter(map);
     * ```
     */
    constructor(
        private readonly map = new Map<string, MemorySharedLockData>(),
    ) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    async deInit(): Promise<void> {
        for (const [key, sharedLock] of this.map) {
            const writerLock = sharedLock.writerLock;
            if (writerLock !== null && writerLock.hasExpiration) {
                clearTimeout(writerLock.timeoutId);
            }

            const readerSemaphore = sharedLock.readerSemaphore;
            if (readerSemaphore !== null) {
                for (const [_, { timeoutId }] of readerSemaphore.slots) {
                    if (timeoutId !== null) {
                        clearTimeout(timeoutId);
                    }
                }
            }

            this.map.delete(key);
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async acquireWriter(
        key: string,
        lockId: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const sharedLock = this.map.get(key);
        const readerSemaphore = sharedLock?.readerSemaphore ?? null;
        if (readerSemaphore !== null) {
            return false;
        }
        let writerLock = sharedLock?.writerLock ?? null;

        if (writerLock !== null) {
            return writerLock.owner === lockId;
        }

        if (ttl === null) {
            writerLock = {
                owner: lockId,
                hasExpiration: false,
            };
            this.map.set(key, {
                writerLock,
                readerSemaphore: null,
            });
        } else {
            const timeoutId = setTimeout(() => {
                this.map.delete(key);
            }, ttl.toMilliseconds());
            writerLock = {
                owner: lockId,
                hasExpiration: true,
                timeoutId,
                expiration: ttl.toEndDate(),
            };
            this.map.set(key, {
                writerLock,
                readerSemaphore: null,
            });
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async releaseWriter(key: string, lockId: string): Promise<boolean> {
        const sharedLock = this.map.get(key);
        const readerSemaphore = sharedLock?.readerSemaphore ?? null;
        if (readerSemaphore !== null) {
            return false;
        }
        const writerLock = sharedLock?.writerLock ?? null;

        if (writerLock === null) {
            return false;
        }
        if (writerLock.owner !== lockId) {
            return false;
        }

        if (writerLock.hasExpiration) {
            clearTimeout(writerLock.timeoutId);
        }
        this.map.delete(key);

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async forceReleaseWriter(key: string): Promise<boolean> {
        const sharedLock = this.map.get(key);
        const readerSemaphore = sharedLock?.readerSemaphore ?? null;
        if (readerSemaphore !== null) {
            return false;
        }
        const writerLock = sharedLock?.writerLock ?? null;

        if (writerLock === null) {
            return false;
        }

        if (writerLock.hasExpiration) {
            clearTimeout(writerLock.timeoutId);
        }

        this.map.delete(key);

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async refreshWriter(
        key: string,
        lockId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        const sharedLock = this.map.get(key);
        const readerSemaphore = sharedLock?.readerSemaphore ?? null;
        if (readerSemaphore !== null) {
            return false;
        }
        const writerLock = sharedLock?.writerLock ?? null;

        if (writerLock === null) {
            return false;
        }
        if (writerLock.owner !== lockId) {
            return false;
        }
        if (!writerLock.hasExpiration) {
            return false;
        }

        clearTimeout(writerLock.timeoutId);
        const timeoutId = setTimeout(() => {
            this.map.delete(key);
        }, ttl.toMilliseconds());
        this.map.set(key, {
            readerSemaphore: null,
            writerLock: {
                ...writerLock,
                timeoutId,
            },
        });

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async acquireReader(settings: SharedLockAcquireSettings): Promise<boolean> {
        const { key, lockId, limit, ttl } = settings;
        const sharedLock = this.map.get(key);
        const writerLock = sharedLock?.writerLock ?? null;
        if (writerLock !== null) {
            return false;
        }
        let readerSemaphore = sharedLock?.readerSemaphore ?? null;

        if (readerSemaphore === null) {
            readerSemaphore = {
                limit,
                slots: new Map(),
            };
            this.map.set(key, {
                readerSemaphore,
                writerLock: null,
            });
        }

        if (readerSemaphore.slots.size >= readerSemaphore.limit) {
            return false;
        }

        if (readerSemaphore.slots.has(lockId)) {
            return true;
        }

        if (ttl === null) {
            readerSemaphore.slots.set(lockId, {
                timeoutId: null,
                expiration: null,
            });
        } else {
            const timeoutId = setTimeout(() => {
                readerSemaphore.slots.delete(lockId);
            }, ttl.toMilliseconds());

            readerSemaphore.slots.set(lockId, {
                timeoutId,
                expiration: ttl.toEndDate(),
            });
        }

        this.map.set(key, {
            readerSemaphore,
            writerLock: null,
        });

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async releaseReader(key: string, lockId: string): Promise<boolean> {
        const sharedLock = this.map.get(key);
        const writerLock = sharedLock?.writerLock ?? null;
        if (writerLock !== null) {
            return false;
        }
        const readerSemaphore = sharedLock?.readerSemaphore ?? null;

        if (readerSemaphore === null) {
            return false;
        }

        const slot = readerSemaphore.slots.get(lockId);
        if (slot === undefined) {
            return false;
        }

        if (slot.timeoutId !== null) {
            clearTimeout(slot.timeoutId);
        }

        readerSemaphore.slots.delete(lockId);
        this.map.set(key, {
            readerSemaphore,
            writerLock: null,
        });

        if (readerSemaphore.slots.size === 0) {
            this.map.delete(key);
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async forceReleaseAllReaders(key: string): Promise<boolean> {
        const sharedLock = this.map.get(key);
        const writerLock = sharedLock?.writerLock ?? null;
        if (writerLock !== null) {
            return false;
        }
        const readerSemaphore = sharedLock?.readerSemaphore ?? null;

        if (readerSemaphore === null) {
            return false;
        }
        const hasSlots = readerSemaphore.slots.size > 0;
        for (const [slotId, { timeoutId }] of readerSemaphore.slots) {
            clearTimeout(timeoutId ?? undefined);
            readerSemaphore.slots.delete(slotId);
        }
        this.map.delete(key);
        return hasSlots;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async refreshReader(
        key: string,
        lockId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        const sharedLock = this.map.get(key);
        const writerLock = sharedLock?.writerLock ?? null;
        if (writerLock !== null) {
            return false;
        }
        const readerSemaphore = sharedLock?.readerSemaphore ?? null;

        if (!readerSemaphore) {
            return false;
        }
        const slot = readerSemaphore.slots.get(lockId);
        if (slot === undefined) {
            return false;
        }
        if (slot.timeoutId === null) {
            return false;
        }

        clearTimeout(slot.timeoutId);
        const timeoutId = setTimeout(() => {
            readerSemaphore.slots.delete(lockId);
            this.map.set(key, {
                readerSemaphore,
                writerLock: null,
            });
        }, ttl.toMilliseconds());

        readerSemaphore.slots.set(lockId, {
            timeoutId,
            expiration: ttl.toEndDate(),
        });
        this.map.set(key, {
            readerSemaphore,
            writerLock: null,
        });

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async forceRelease(key: string): Promise<boolean> {
        const [hasReleasedAllReaders, hasReleasedWriter] = await Promise.all([
            this.forceReleaseAllReaders(key),
            this.forceReleaseWriter(key),
        ]);
        return hasReleasedAllReaders || hasReleasedWriter;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getState(key: string): Promise<ISharedLockAdapterState | null> {
        const sharedLock = this.map.get(key);

        if (sharedLock === undefined) {
            return null;
        }

        const { writerLock, readerSemaphore } = sharedLock;

        if (
            writerLock === null &&
            readerSemaphore !== null &&
            readerSemaphore.slots.size === 0
        ) {
            return null;
        }
        if (
            writerLock === null &&
            readerSemaphore !== null &&
            readerSemaphore.slots.size !== 0
        ) {
            return {
                writer: null,
                reader: {
                    limit: readerSemaphore.limit,
                    acquiredSlots: new Map(
                        [...readerSemaphore.slots.entries()].map(
                            ([key, value]) => [key, value.expiration] as const,
                        ),
                    ),
                },
            };
        }

        if (
            readerSemaphore === null &&
            writerLock !== null &&
            !writerLock.hasExpiration
        ) {
            return {
                reader: null,
                writer: {
                    owner: writerLock.owner,
                    expiration: null,
                },
            };
        }
        if (
            readerSemaphore === null &&
            writerLock !== null &&
            writerLock.hasExpiration &&
            writerLock.expiration <= new Date()
        ) {
            return null;
        }
        if (
            readerSemaphore === null &&
            writerLock !== null &&
            writerLock.hasExpiration
        ) {
            return {
                reader: null,
                writer: {
                    owner: writerLock.owner,
                    expiration: writerLock.expiration,
                },
            };
        }

        throw new UnexpectedError(
            "Invalid ISharedLockAdapterState, expected either the reader field must be defined or the writer field must be defined, but not both.",
        );
    }
}
