/**
 * @module Semaphore
 */

import { LazyPromise } from "@/async/_module-exports.js";
import { type IEventDispatcher } from "@/event-bus/contracts/_module-exports.js";
import type {
    IDatabaseSemaphoreAdapter,
    ISemaphoreAdapter,
    SemaphoreAdapterVariants,
    SemaphoreEventMap,
} from "@/semaphore/contracts/_module-exports.js";
import {
    type ISemaphore,
    type SemaphoreAquireBlockingSettings,
    FailedRefreshSemaphoreError,
    LimitReachedSemaphoreError,
    FailedReleaseSemaphoreError,
    SemaphoreError,
    SEMAPHORE_EVENTS,
    SEMAPHORE_STATE,
} from "@/semaphore/contracts/_module-exports.js";
import type { ISemaphoreState } from "@/semaphore/contracts/_module-exports.js";
import {
    TimeSpan,
    type InvokableFn,
    type Namespace,
} from "@/utilities/_module-exports.js";
import type { Key } from "@/utilities/_module-exports.js";
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
    originalAdapter: SemaphoreAdapterVariants;
    eventDispatcher: IEventDispatcher<SemaphoreEventMap>;
    key: Key;
    ttl: TimeSpan | null;
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
    defaultRefreshTime: TimeSpan;
    namespace: Namespace;
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
            key: deserializedValue._key.resolved,
            limit: deserializedValue.limit,
            slotId: deserializedValue.slotId,
            ttlInMs: deserializedValue._ttl?.toMilliseconds() ?? null,
        };
    }

    private readonly slotId: string;
    private readonly limit: number;
    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    private readonly adapter: ISemaphoreAdapter;
    private readonly originalAdapter:
        | ISemaphoreAdapter
        | IDatabaseSemaphoreAdapter;
    private readonly eventDispatcher: IEventDispatcher<SemaphoreEventMap>;
    private readonly _key: Key;
    private _ttl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serdeTransformerName: string;
    private readonly namespace: Namespace;

    constructor(settings: SemaphoreSettings) {
        const {
            slotId,
            limit,
            createLazyPromise,
            adapter,
            originalAdapter,
            eventDispatcher,
            key,
            ttl,
            serdeTransformerName,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            namespace,
        } = settings;
        this.namespace = namespace;
        this.slotId = slotId;
        this.limit = limit;
        this.serdeTransformerName = serdeTransformerName;
        this.createLazyPromise = createLazyPromise;
        this.adapter = adapter;
        this.eventDispatcher = eventDispatcher;
        this._key = key;
        this._ttl = ttl;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
        this.originalAdapter = originalAdapter;
    }

    _internal_getNamespace(): Namespace {
        return this.namespace;
    }

    _internal_getSerdeTransformerName(): string {
        return this.serdeTransformerName;
    }

    _internal_getAdapter(): IDatabaseSemaphoreAdapter | ISemaphoreAdapter {
        return this.originalAdapter;
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
                                `Key "${this._key.resolved}" has reached the limit ${String(this.limit)}`,
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
                                `Key "${this._key.resolved}" has reached the limit ${String(this.limit)}`,
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

    private async handleUnexpectedError<TReturn>(
        fn: InvokableFn<[], Promise<TReturn>>,
    ): Promise<TReturn> {
        try {
            return await fn();
        } catch (error: unknown) {
            if (error instanceof SemaphoreError) {
                throw error;
            }
            this.eventDispatcher
                .dispatch(SEMAPHORE_EVENTS.UNEXPECTED_ERROR, {
                    error,
                    semaphore: this,
                })
                .defer();
            throw error;
        }
    }

    acquire(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasAquired = await this.adapter.acquire({
                    key: this._key.namespaced,
                    slotId: this.slotId,
                    limit: this.limit,
                    ttl: this._ttl,
                });

                if (hasAquired) {
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.ACQUIRED, {
                            semaphore: this,
                        })
                        .defer();
                } else {
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.LIMIT_REACHED, {
                            semaphore: this,
                        })
                        .defer();
                }

                return hasAquired;
            });
        });
    }

    acquireOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new LimitReachedSemaphoreError(
                    `Key "${this._key.resolved}" has reached the limit`,
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
                    `Key "${this._key.resolved}" has reached the limit`,
                );
            }
        });
    }

    release(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.release(
                    this._key.namespaced,
                    this.slotId,
                );

                if (hasReleased) {
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.RELEASED, {
                            semaphore: this,
                        })
                        .defer();
                } else {
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.FAILED_RELEASE, {
                            semaphore: this,
                        })
                        .defer();
                }

                return hasReleased;
            });
        });
    }

    releaseOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasReleased = await this.release();
            if (!hasReleased) {
                throw new FailedReleaseSemaphoreError(
                    `Failed to release slot "${this.slotId}" of key "${this._key.resolved}"`,
                );
            }
        });
    }

    forceReleaseAll(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.forceReleaseAll(
                    this._key.namespaced,
                );

                this.eventDispatcher
                    .dispatch(SEMAPHORE_EVENTS.ALL_FORCE_RELEASED, {
                        semaphore: this,
                        hasReleased,
                    })
                    .defer();

                return hasReleased;
            });
        });
    }

    refresh(ttl: TimeSpan = this.defaultRefreshTime): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasRefreshed = await this.adapter.refresh(
                    this._key.namespaced,
                    this.slotId,
                    ttl,
                );

                if (hasRefreshed) {
                    this._ttl = ttl;
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.REFRESHED, {
                            semaphore: this,
                        })
                        .defer();
                } else {
                    this.eventDispatcher
                        .dispatch(SEMAPHORE_EVENTS.FAILED_REFRESH, {
                            semaphore: this,
                        })
                        .defer();
                }

                return hasRefreshed;
            });
        });
    }

    refreshOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasRefreshed = await this.refresh(ttl);
            if (!hasRefreshed) {
                throw new FailedRefreshSemaphoreError(
                    `Failed to refresh slot "${this.slotId}" of key "${this._key.resolved}"`,
                );
            }
        });
    }

    get id(): string {
        return this.slotId;
    }

    get ttl(): TimeSpan | null {
        return this._ttl;
    }

    get key(): string {
        return this._key.resolved;
    }

    getState(): LazyPromise<ISemaphoreState> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(
                async (): Promise<ISemaphoreState> => {
                    const state = await this.adapter.getState(
                        this._key.namespaced,
                    );
                    if (state === null) {
                        return {
                            type: SEMAPHORE_STATE.EXPIRED,
                        };
                    }

                    if (state.acquiredSlots.size >= state.limit) {
                        return {
                            type: SEMAPHORE_STATE.LIMIT_REACHED,
                            limit: state.limit,
                            acquiredSlots: [...state.acquiredSlots.keys()],
                        };
                    }

                    const slot = state.acquiredSlots.get(this.slotId);
                    if (slot === undefined) {
                        return {
                            type: SEMAPHORE_STATE.UNACQUIRED,
                            acquiredSlots: [...state.acquiredSlots.keys()],
                            acquiredSlotsCount: state.acquiredSlots.size,
                            freeSlotsCount:
                                state.limit - state.acquiredSlots.size,
                            limit: state.limit,
                        };
                    }

                    return {
                        type: SEMAPHORE_STATE.ACQUIRED,
                        acquiredSlots: [...state.acquiredSlots.keys()],
                        acquiredSlotsCount: state.acquiredSlots.size,
                        freeSlotsCount: state.limit - state.acquiredSlots.size,
                        limit: state.limit,
                        remainingTime:
                            slot === null
                                ? null
                                : TimeSpan.fromDateRange(new Date(), slot),
                    };
                },
            );
        });
    }
}
