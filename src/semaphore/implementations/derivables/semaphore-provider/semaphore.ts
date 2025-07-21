/**
 * @module Semaphore
 */

import { LazyPromise } from "@/async/_module-exports.js";
import { type IEventDispatcher } from "@/event-bus/contracts/_module-exports.js";
import type {
    AcquiredSemaphoreEvent,
    AllReleasedSemaphoreEvent,
    ExpiredRefreshTrySemaphoreEvent,
    ISemaphoreAdapter,
    RefreshedSemaphoreEvent,
    ReleasedSemaphoreEvent,
    SemaphoreEventMap,
    UnavailableSlotsSemaphoreEvent,
    UnexpectedErrorSemaphoreEvent,
} from "@/semaphore/contracts/_module-exports.js";
import {
    type ISemaphore,
    type SemaphoreAquireBlockingSettings,
    ExpiredRefreshSemaphoreError,
    ReachedLimitSemaphoreError,
    SEMAPHORE_EVENTS,
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
import type { SemaphoreSlotState } from "@/semaphore/implementations/derivables/semaphore-provider/semaphore-slot-state.js";

/**
 * @internal
 */
export type ISerializedSemaphore = {
    key: string;
    slotId: string;
    expirationInMs: number | null;
    keyState: Partial<Record<string, number | null>>;
    limit: number;
    ttlInMs: number | null;
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
    semaphoreState: SemaphoreSlotState;
    eventDispatcher: IEventDispatcher<SemaphoreEventMap>;
    key: Key;
    ttl: TimeSpan | null;
    expirationInMs?: number | null;
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
            slotId: deserializedValue.semaphoreSlotState.slotId,
            expirationInMs:
                deserializedValue.semaphoreSlotState
                    .get()
                    ?.toEndDate()
                    .getTime() ?? null,
            keyState: {},
            limit: deserializedValue.limit_,
            ttlInMs: deserializedValue.ttl?.toMilliseconds() ?? null,
        };
    }

    private readonly slotId: string;
    private readonly limit_: number;
    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    private readonly adapter: ISemaphoreAdapter;
    private readonly semaphoreSlotState: SemaphoreSlotState;
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
            semaphoreState,
            eventDispatcher,
            key,
            ttl,
            serdeTransformerName,
            expirationInMs,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
        } = settings;
        this.slotId = slotId;
        this.limit_ = limit;
        this.serdeTransformerName = serdeTransformerName;
        this.createLazyPromise = createLazyPromise;
        this.adapter = adapter;
        this.semaphoreSlotState = semaphoreState;
        if (expirationInMs !== undefined && expirationInMs === null) {
            this.semaphoreSlotState.set(null);
        }
        if (expirationInMs !== undefined && expirationInMs !== null) {
            this.semaphoreSlotState.set(
                TimeSpan.fromDateRange(new Date(), new Date(expirationInMs)),
            );
        }
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
    ): LazyPromise<Result<TValue, ReachedLimitSemaphoreError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, ReachedLimitSemaphoreError>> => {
                try {
                    const hasAquired = await this.acquire();
                    if (!hasAquired) {
                        return resultFailure(
                            new ReachedLimitSemaphoreError(
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
    ): LazyPromise<Result<TValue, ReachedLimitSemaphoreError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, ReachedLimitSemaphoreError>> => {
                try {
                    const hasAquired = await this.acquireBlocking(settings);
                    if (!hasAquired) {
                        return resultFailure(
                            new ReachedLimitSemaphoreError(
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
            try {
                const hasAquired = await this.adapter.acquire({
                    key: this.key.namespaced,
                    slotId: this.slotId,
                    limit: this.limit_,
                    ttl: this.ttl,
                });
                if (hasAquired) {
                    this.semaphoreSlotState.set(this.ttl);
                    const event: AcquiredSemaphoreEvent = {
                        key: this.key.resolved,
                        slotId: this.slotId,
                        ttl: this.ttl,
                        limit: this.limit_,
                        availableSlots: await this.availableSlots(),
                        unavailableSlots: await this.unavailableSlots(),
                    };
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.ACQUIRED, event)
                        .defer();
                } else {
                    const event: UnavailableSlotsSemaphoreEvent = {
                        key: this.key.resolved,
                        limit: this.limit_,
                        availableSlots: await this.availableSlots(),
                        unavailableSlots: await this.unavailableSlots(),
                    };
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.UNAVAILABLE_SLOTS, event)
                        .defer();
                }
                return hasAquired;
            } catch (error: unknown) {
                const event: UnexpectedErrorSemaphoreEvent = {
                    key: this.key.resolved,
                    ttl: this.ttl,
                    limit: this.limit_,
                    availableSlots: await this.availableSlots(),
                    unavailableSlots: await this.unavailableSlots(),
                    error,
                };
                this.eventDispatcher
                    .dispatch(SEMAPHORE_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();

                throw error;
            }
        });
    }

    acquireOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new ReachedLimitSemaphoreError(
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
                throw new ReachedLimitSemaphoreError(
                    `Key "${this.key.resolved}" has reached the limit ${String(this.limit_)}`,
                );
            }
        });
    }

    release(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            try {
                await this.adapter.release(this.key.namespaced, this.slotId);
                this.semaphoreSlotState.remove();
                const event: ReleasedSemaphoreEvent = {
                    key: this.key.resolved,
                    slotId: this.slotId,
                    limit: this.limit_,
                    availableSlots: await this.availableSlots(),
                    unavailableSlots: await this.unavailableSlots(),
                };
                this.eventDispatcher
                    .dispatch(SEMAPHORE_EVENTS.RELEASED, event)
                    .defer();
            } catch (error: unknown) {
                const event: UnexpectedErrorSemaphoreEvent = {
                    key: this.key.resolved,
                    ttl: this.ttl,
                    limit: this.limit_,
                    availableSlots: await this.availableSlots(),
                    unavailableSlots: await this.unavailableSlots(),
                    error,
                };
                this.eventDispatcher
                    .dispatch(SEMAPHORE_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw error;
            }
        });
    }

    forceReleaseAll(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            await this.adapter.forceReleaseAll(this.key.namespaced);

            const event: AllReleasedSemaphoreEvent = {
                key: this.key.resolved,
                slotIds: this.semaphoreSlotState.getAllSlotIds(),
                limit: this.limit_,
                availableSlots: await this.availableSlots(),
                unavailableSlots: await this.unavailableSlots(),
            };
            this.eventDispatcher.dispatch(SEMAPHORE_EVENTS.ALL_RELEASED, event);

            this.semaphoreSlotState.removeAll();
        });
    }

    isExpired(): LazyPromise<boolean> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            try {
                return this.semaphoreSlotState.isExpired();
            } catch (error: unknown) {
                const event: UnexpectedErrorSemaphoreEvent = {
                    key: this.key.resolved,
                    ttl: this.ttl,
                    limit: this.limit_,
                    availableSlots: await this.availableSlots(),
                    unavailableSlots: await this.unavailableSlots(),
                    error,
                };
                this.eventDispatcher
                    .dispatch(SEMAPHORE_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw error;
            }
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
            try {
                const hasRefreshed = await this.adapter.refresh(
                    this.key.namespaced,
                    this.slotId,
                    ttl,
                );
                if (hasRefreshed) {
                    this.semaphoreSlotState.set(ttl);
                    const event: RefreshedSemaphoreEvent = {
                        key: this.key.resolved,
                        slotId: this.slotId,
                        ttl,
                        limit: this.limit_,
                        availableSlots: await this.availableSlots(),
                        unavailableSlots: await this.unavailableSlots(),
                    };
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.REFRESHED, event)
                        .defer();
                } else {
                    const event: ExpiredRefreshTrySemaphoreEvent = {
                        key: this.key.resolved,
                        limit: this.limit_,
                        availableSlots: await this.availableSlots(),
                        unavailableSlots: await this.unavailableSlots(),
                    };
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.EXPIRED_REFRESH_TRY, event)
                        .defer();
                }
                return hasRefreshed;
            } catch (error: unknown) {
                const event: UnexpectedErrorSemaphoreEvent = {
                    key: this.key.resolved,
                    ttl: this.ttl,
                    limit: this.limit_,
                    availableSlots: await this.availableSlots(),
                    unavailableSlots: await this.unavailableSlots(),
                    error,
                };
                this.eventDispatcher
                    .dispatch(SEMAPHORE_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw error;
            }
        });
    }

    refreshOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasRefreshed = await this.refresh(ttl);
            if (!hasRefreshed) {
                throw new ExpiredRefreshSemaphoreError(
                    `Attempted to refresh expired key "${this.key.resolved}"`,
                );
            }
        });
    }

    getRemainingTime(): LazyPromise<TimeSpan | null> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            try {
                return this.semaphoreSlotState.get();
            } catch (error: unknown) {
                const event: UnexpectedErrorSemaphoreEvent = {
                    key: this.key.resolved,
                    ttl: this.ttl,
                    limit: this.limit_,
                    availableSlots: await this.availableSlots(),
                    unavailableSlots: await this.unavailableSlots(),
                    error,
                };
                this.eventDispatcher
                    .dispatch(SEMAPHORE_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw error;
            }
        });
    }

    limit(): LazyPromise<number> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => this.limit_);
    }

    availableSlots(): LazyPromise<number> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            return this.semaphoreSlotState.availableSlots();
        });
    }

    unavailableSlots(): LazyPromise<number> {
        return new LazyPromise(async () => {
            return (await this.limit()) - (await this.availableSlots());
        });
    }
}
