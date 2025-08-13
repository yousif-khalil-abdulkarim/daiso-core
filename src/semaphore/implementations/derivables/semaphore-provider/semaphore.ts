/**
 * @module Semaphore
 */

import { LazyPromise } from "@/async/_module-exports.js";
import { type IEventDispatcher } from "@/event-bus/contracts/_module-exports.js";
import type {
    ISemaphoreAdapter,
    SemaphoreEventMap,
} from "@/semaphore/contracts/_module-exports.js";
import {
    type ISemaphore,
    type SemaphoreAquireBlockingSettings,
    UnsuccessfulRefreshSemaphoreError,
    LimitReachedSemaphoreError,
    UnsuccessfulReleaseSemaphoreError,
} from "@/semaphore/contracts/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { type Key } from "@/utilities/_module-exports.js";
import {
    resolveLazyable,
    resultFailure,
    resultSuccess,
    type AsyncLazy,
    type Result,
} from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export type ISerializedSemaphore = {
    key: string;
    slotId: string;
    limit: number;
    expirationInMs: number | null;
};

/**
 * @internal
 */
export type SemaphoreSettings = {
    slotId: string;
    limit: number;
    createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    serdeTransformerName: string;
    adapter: ISemaphoreAdapter;
    eventDispatcher: IEventDispatcher<SemaphoreEventMap>;
    key: Key;
    ttl: TimeSpan | null;
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
    defaultRefreshTime: TimeSpan;
};

/**
 * @internal
 */
export class Semaphore implements ISemaphore {
    /**
     * @internal
     */
    static _internal_serialize(
        deserializedValue: Semaphore,
    ): ISerializedSemaphore {
        return {
            key: deserializedValue.key.resolved,
            limit: deserializedValue.limit_,
            slotId: deserializedValue.slotId,
            expirationInMs:
                deserializedValue.ttl?.toEndDate().getTime() ?? null,
        };
    }

    private readonly slotId: string;
    private readonly limit_: number;
    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    private readonly adapter: ISemaphoreAdapter;
    private readonly eventDispatcher: IEventDispatcher<SemaphoreEventMap>;
    private readonly key: Key;
    private readonly ttl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serdeTransformerName: string;

    constructor(settings: SemaphoreSettings) {
        const {
            slotId,
            limit,
            createLazyPromise,
            adapter,
            eventDispatcher,
            key,
            ttl,
            serdeTransformerName,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
        } = settings;
        this.slotId = slotId;
        this.limit_ = limit;
        this.serdeTransformerName = serdeTransformerName;
        this.createLazyPromise = createLazyPromise;
        this.adapter = adapter;
        this.eventDispatcher = eventDispatcher;
        this.key = key;
        this.ttl = ttl;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
    }

    _internal_getSerdeTransformerName(): string {
        return this.serdeTransformerName;
    }

    run<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<Result<TValue, LimitReachedSemaphoreError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, LimitReachedSemaphoreError>> => {
                try {
                    const hasAquired = await this.acquire();
                    if (!hasAquired) {
                        return resultFailure(
                            new LimitReachedSemaphoreError(
                                `Key "${this.key.resolved}" has reached the limit ${String(this.limit_)}`,
                            ),
                        );
                    }

                    return resultSuccess(await resolveLazyable(asyncFn));
                } finally {
                    await this.release();
                }
            },
        );
    }

    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): LazyPromise<TValue> {
        return this.createLazyPromise(async () => {
            try {
                await this.acquireOrFail();
                return await resolveLazyable(asyncFn);
            } finally {
                await this.release();
            }
        });
    }

    runBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<Result<TValue, LimitReachedSemaphoreError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, LimitReachedSemaphoreError>> => {
                try {
                    const hasAquired = await this.acquireBlocking(settings);
                    if (!hasAquired) {
                        return resultFailure(
                            new LimitReachedSemaphoreError(
                                `Key "${this.key.resolved}" has reached the limit ${String(this.limit_)}`,
                            ),
                        );
                    }

                    return resultSuccess(await resolveLazyable(asyncFn));
                } finally {
                    await this.release();
                }
            },
        );
    }

    runBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<TValue> {
        return this.createLazyPromise(async () => {
            try {
                await this.acquireBlockingOrFail(settings);

                return await resolveLazyable(asyncFn);
            } finally {
                await this.release();
            }
        });
    }

    acquire(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.adapter.acquire({
                key: this.key.namespaced,
                slotId: this.slotId,
                limit: this.limit_,
                ttl: this.ttl,
            });

            if (hasAquired) {
            } else {
            }

            return hasAquired;
        });
    }

    acquireOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new LimitReachedSemaphoreError(
                    `Key "${this.key.resolved}" has reached the limit ${String(this.limit_)}`,
                );
            }
        });
    }

    acquireBlocking(
        settings: SemaphoreAquireBlockingSettings = {},
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const {
                time = this.defaultBlockingTime,
                interval = this.defaultBlockingInterval,
            } = settings;
            const endDate = time.toEndDate();
            while (endDate.getTime() > new Date().getTime()) {
                const hasAquired = await this.acquire();
                if (hasAquired) {
                    return true;
                }
                await LazyPromise.delay(interval);
            }
            return false;
        });
    }

    acquireBlockingOrFail(
        settings?: SemaphoreAquireBlockingSettings,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquireBlocking(settings);
            if (!hasAquired) {
                throw new LimitReachedSemaphoreError(
                    `Key "${this.key.resolved}" has reached the limit ${String(this.limit_)}`,
                );
            }
        });
    }

    release(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const hasReleased = await this.adapter.release(
                this.key.namespaced,
                this.slotId,
            );

            if (hasReleased) {
            }

            return hasReleased;
        });
    }

    releaseOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasReleased = await this.release();
            if (!hasReleased) {
                throw new UnsuccessfulReleaseSemaphoreError("!!__MESSAGE__!!");
            }
        });
    }

    forceReleaseAll(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const hasReleasedAll = await this.adapter.forceReleaseAll(
                this.key.namespaced,
            );

            if (hasReleasedAll) {
            }

            return hasReleasedAll;
        });
    }

    isExpired(): LazyPromise<boolean> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            const state = await this.adapter.getState(this.key.namespaced);
            const semaphoreNotFound = state === null;
            if (semaphoreNotFound) {
                return false;
            }
            const acquiredSlots = [...state.acquiredSlots.keys()];
            return acquiredSlots.every((slotId) => slotId !== this.slotId);
        });
    }

    isAcquired(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const isExpired = await this.isExpired();
            return !isExpired;
        });
    }

    refresh(ttl: TimeSpan = this.defaultRefreshTime): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const hasRefreshed = await this.adapter.refresh(
                this.key.namespaced,
                this.slotId,
                ttl,
            );

            if (hasRefreshed) {
            } else {
            }

            return hasRefreshed;
        });
    }

    refreshOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasRefreshed = await this.refresh(ttl);
            if (!hasRefreshed) {
                throw new UnsuccessfulRefreshSemaphoreError(
                    `Attempted to refresh expired key "${this.key.resolved}"`,
                );
            }
        });
    }

    getRemainingTime(): LazyPromise<TimeSpan | null> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            const state = await this.adapter.getState(this.key.namespaced);
            const semaphoreNotFound = state === null;
            if (semaphoreNotFound) {
                return null;
            }
            const expiration = state.acquiredSlots.get(this.slotId);
            const slotNotFound = expiration === undefined;
            if (slotNotFound) {
                return null;
            }
            const isUnexpireable = expiration === null;
            if (isUnexpireable) {
                return null;
            }
            return TimeSpan.fromDateRange(new Date(), expiration);
        });
    }

    getLimit(): LazyPromise<number | null> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            const state = await this.adapter.getState(this.key.namespaced);
            const semaphoreNotFound = state === null;
            if (semaphoreNotFound) {
                return null;
            }
            return state.limit;
        });
    }

    availableSlots(): LazyPromise<number | null> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            const state = await this.adapter.getState(this.key.namespaced);
            const semaphoreNotFound = state === null;
            if (semaphoreNotFound) {
                return null;
            }
            return state.limit - state.acquiredSlots.size;
        });
    }

    unavailableSlots(): LazyPromise<number | null> {
        return this.createLazyPromise(async () => {
            const state = await this.adapter.getState(this.key.namespaced);
            const semaphoreNotFound = state === null;
            if (semaphoreNotFound) {
                return null;
            }
            return state.acquiredSlots.size;
        });
    }
}
