/**
 * @module SharedLock
 */

import { LazyPromise } from "@/async/_module-exports.js";
import type { IEventDispatcher } from "@/event-bus/contracts/event-bus.contract.js";
import {
    FailedAcquireWriterLockError,
    FailedRefreshReaderSemaphoreError,
    FailedRefreshWriterLockError,
    FailedReleaseReaderSemaphoreError,
    FailedReleaseWriterLockError,
    LimitReachedReaderSemaphoreError,
    SHARED_LOCK_EVENTS,
    SharedLockError,
    type AcquiredWriterLockEvent,
    type FailedRefreshWriterLockEvent,
    type FailedReleaseWriterLockEvent,
    type ForceReleasedWriterLockEvent,
    type IDatabaseSharedLockAdapter,
    type ISharedLock,
    type ISharedLockAdapter,
    type ISharedLockState,
    type RefreshedWriterLockEvent,
    type ReleasedWriterLockEvent,
    type SharedLockAquireBlockingSettings,
    type SharedLockEventMap,
    type UnavailableWriterLockEvent,
} from "@/shared-lock/contracts/_module-exports.js";
import {
    resolveLazyable,
    resultFailure,
    resultSuccess,
    type AsyncLazy,
    type InvokableFn,
    type Key,
    type Namespace,
    type Result,
    type TimeSpan,
} from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export type ISerializedSharedLock = {
    key: string;
    lockId: string;
    limit: number;
    ttlInMs: number | null;
};

/**
 * @internal
 */
export type SharedLockSettings = {
    createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    serdeTransformerName: string;
    namespace: Namespace;
    adapter: ISharedLockAdapter;
    originalAdapter: IDatabaseSharedLockAdapter | ISharedLockAdapter;
    eventDispatcher: IEventDispatcher<SharedLockEventMap>;
    limit: number;
    key: Key;
    lockId: string;
    ttl: TimeSpan | null;
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
    defaultRefreshTime: TimeSpan;
};

/**
 * @internal
 */
export class SharedLock implements ISharedLock {
    /**
     * @internal
     */
    static _internal_serialize(
        deserializedValue: SharedLock,
    ): ISerializedSharedLock {
        return {
            key: deserializedValue.key.resolved,
            limit: deserializedValue.limit,
            lockId: deserializedValue.lockId,
            ttlInMs: deserializedValue.ttl?.toMilliseconds() ?? null,
        };
    }

    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    private readonly namespace: Namespace;
    private readonly adapter: ISharedLockAdapter;
    private readonly originalAdapter:
        | IDatabaseSharedLockAdapter
        | ISharedLockAdapter;
    private readonly eventDispatcher: IEventDispatcher<SharedLockEventMap>;
    private readonly key: Key;
    private readonly lockId: string;
    private readonly ttl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serdeTransformerName: string;
    private readonly limit: number;

    constructor(settings: SharedLockSettings) {
        const {
            createLazyPromise,
            namespace,
            adapter,
            originalAdapter,
            eventDispatcher,
            key,
            lockId,
            ttl,
            serdeTransformerName,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            limit,
        } = settings;
        this.limit = limit;
        this.namespace = namespace;
        this.originalAdapter = originalAdapter;
        this.serdeTransformerName = serdeTransformerName;
        this.createLazyPromise = createLazyPromise;
        this.adapter = adapter;
        this.eventDispatcher = eventDispatcher;
        this.key = key;
        this.lockId = lockId;
        this.ttl = ttl;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
    }

    _internal_getNamespace(): Namespace {
        return this.namespace;
    }

    _internal_getSerdeTransformerName(): string {
        return this.serdeTransformerName;
    }

    _internal_getAdapter(): IDatabaseSharedLockAdapter | ISharedLockAdapter {
        return this.originalAdapter;
    }

    runReader<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<Result<TValue, LimitReachedReaderSemaphoreError>> {
        return this.createLazyPromise(
            async (): Promise<
                Result<TValue, LimitReachedReaderSemaphoreError>
            > => {
                try {
                    const hasAquired = await this.acquireReader();
                    if (!hasAquired) {
                        return resultFailure(
                            new LimitReachedReaderSemaphoreError(
                                `Key "${this.key.resolved}" already acquired`,
                            ),
                        );
                    }

                    return resultSuccess(await resolveLazyable(asyncFn));
                } finally {
                    await this.releaseReader();
                }
            },
        );
    }

    runReaderOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<TValue> {
        return this.createLazyPromise(async () => {
            try {
                await this.acquireReaderOrFail();
                return await resolveLazyable(asyncFn);
            } finally {
                await this.releaseReader();
            }
        });
    }

    runReaderBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SharedLockAquireBlockingSettings,
    ): LazyPromise<Result<TValue, LimitReachedReaderSemaphoreError>> {
        return this.createLazyPromise(
            async (): Promise<
                Result<TValue, LimitReachedReaderSemaphoreError>
            > => {
                try {
                    const hasAquired =
                        await this.acquireReaderBlocking(settings);
                    if (!hasAquired) {
                        return resultFailure(
                            new LimitReachedReaderSemaphoreError(
                                `Key "${this.key.resolved}" has reached the limit ${String(this.limit)}`,
                            ),
                        );
                    }

                    return resultSuccess(await resolveLazyable(asyncFn));
                } finally {
                    await this.releaseReader();
                }
            },
        );
    }

    runReaderBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SharedLockAquireBlockingSettings,
    ): LazyPromise<TValue> {
        return this.createLazyPromise(async () => {
            try {
                await this.acquireReaderBlockingOrFail(settings);

                return await resolveLazyable(asyncFn);
            } finally {
                await this.releaseReader();
            }
        });
    }

    private async handleUnexpectedError<TReturn>(
        fn: InvokableFn<[], Promise<TReturn>>,
    ): Promise<TReturn> {
        try {
            return await fn();
        } catch (error: unknown) {
            if (error instanceof SharedLockError) {
                throw error;
            }
            this.eventDispatcher
                .dispatch(SHARED_LOCK_EVENTS.UNEXPECTED_ERROR, {
                    error,
                    lockId: this.lockId,
                    key: this.key.resolved,
                    ttl: this.ttl,
                    sharedLock: this,
                })
                .defer();
            throw error;
        }
    }

    acquireReader(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasAquired = await this.adapter.acquireReader({
                    key: this.key.namespaced,
                    lockId: this.lockId,
                    limit: this.limit,
                    ttl: this.ttl,
                });

                if (hasAquired) {
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.READER_ACQUIRED, {
                            key: this.key.resolved,
                            sharedLock: this,
                            lockId: this.lockId,
                            ttl: this.ttl,
                        })
                        .defer();
                } else {
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.READER_LIMIT_REACHED, {
                            lockId: this.lockId,
                            key: this.key.resolved,
                            sharedLock: this,
                        })
                        .defer();
                }

                return hasAquired;
            });
        });
    }

    acquireReaderOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquireReader();
            if (!hasAquired) {
                throw new LimitReachedReaderSemaphoreError(
                    `Key "${this.key.resolved}" has reached the limit`,
                );
            }
        });
    }

    acquireReaderBlocking(
        settings: SharedLockAquireBlockingSettings = {},
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const {
                time = this.defaultBlockingTime,
                interval = this.defaultBlockingInterval,
            } = settings;
            const endDate = time.toEndDate();
            while (endDate.getTime() > new Date().getTime()) {
                const hasAquired = await this.acquireReader();
                if (hasAquired) {
                    return true;
                }
                await LazyPromise.delay(interval);
            }
            return false;
        });
    }

    acquireReaderBlockingOrFail(
        settings?: SharedLockAquireBlockingSettings,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquireReaderBlocking(settings);
            if (!hasAquired) {
                throw new LimitReachedReaderSemaphoreError(
                    `Key "${this.key.resolved}" has reached the limit`,
                );
            }
        });
    }

    releaseReader(): LazyPromise<boolean> {
        throw new Error("Method not implemented.");
    }

    releaseReaderOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasReleased = await this.releaseReader();
            if (!hasReleased) {
                throw new FailedReleaseReaderSemaphoreError(
                    `Failed to release lock "${this.lockId}" of key "${this.key.resolved}"`,
                );
            }
        });
    }

    forceReleaseAllReaders(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.forceReleaseAllReaders(
                    this.key.namespaced,
                );

                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.READER_ALL_FORCE_RELEASED, {
                        key: this.key.resolved,
                        sharedLock: this,
                        hasReleased,
                    })
                    .defer();

                return hasReleased;
            });
        });
    }

    refreshReader(
        ttl: TimeSpan = this.defaultRefreshTime,
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasRefreshed = await this.adapter.refreshReader(
                    this.key.namespaced,
                    this.lockId,
                    ttl,
                );

                if (hasRefreshed) {
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.READER_REFRESHED, {
                            key: this.key.resolved,
                            sharedLock: this,
                            lockId: this.lockId,
                            newTtl: ttl,
                        })
                        .defer();
                } else {
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.READER_FAILED_REFRESH, {
                            lockId: this.lockId,
                            key: this.key.resolved,
                            sharedLock: this,
                        })
                        .defer();
                }

                return hasRefreshed;
            });
        });
    }

    refreshReaderOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasRefreshed = await this.refreshReader(ttl);
            if (!hasRefreshed) {
                throw new FailedRefreshReaderSemaphoreError(
                    `Failed to refresh lock "${this.lockId}" of key "${this.key.resolved}"`,
                );
            }
        });
    }

    runWriter<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<Result<TValue, FailedAcquireWriterLockError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, FailedAcquireWriterLockError>> => {
                try {
                    const hasAquired = await this.acquireWriter();
                    if (!hasAquired) {
                        return resultFailure(
                            new FailedAcquireWriterLockError(
                                `Key "${this.key.resolved}" already acquired`,
                            ),
                        );
                    }

                    return resultSuccess(await resolveLazyable(asyncFn));
                } finally {
                    await this.releaseWriter();
                }
            },
        );
    }

    runWriterOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): LazyPromise<TValue> {
        return this.createLazyPromise(async () => {
            try {
                await this.acquireWriterOrFail();
                return await resolveLazyable(asyncFn);
            } finally {
                await this.releaseWriter();
            }
        });
    }

    runWriterBlocking<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SharedLockAquireBlockingSettings,
    ): LazyPromise<Result<TValue, FailedAcquireWriterLockError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, FailedAcquireWriterLockError>> => {
                try {
                    const hasAquired =
                        await this.acquireWriterBlocking(settings);
                    if (!hasAquired) {
                        return resultFailure(
                            new FailedAcquireWriterLockError(
                                `Key "${this.key.resolved}" already acquired`,
                            ),
                        );
                    }

                    return resultSuccess(await resolveLazyable(asyncFn));
                } finally {
                    await this.releaseWriter();
                }
            },
        );
    }

    runWriterBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: SharedLockAquireBlockingSettings,
    ): LazyPromise<TValue> {
        return this.createLazyPromise(async () => {
            try {
                await this.acquireWriterBlockingOrFail(settings);

                return await resolveLazyable(asyncFn);
            } finally {
                await this.releaseWriter();
            }
        });
    }

    acquireWriter(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasAquired = await this.adapter.acquireWriter(
                    this.key.namespaced,
                    this.lockId,
                    this.ttl,
                );

                if (hasAquired) {
                    const event: AcquiredWriterLockEvent = {
                        key: this.key.resolved,
                        lockId: this.lockId,
                        ttl: this.ttl,
                        sharedLock: this,
                    };
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.WRITER_ACQUIRED, event)
                        .defer();
                    return hasAquired;
                }

                const event: UnavailableWriterLockEvent = {
                    key: this.key.resolved,
                    lockId: this.lockId,
                    sharedLock: this,
                };
                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.WRITER_UNAVAILABLE, event)
                    .defer();

                return hasAquired;
            });
        });
    }

    acquireWriterOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquireWriter();
            if (!hasAquired) {
                throw new FailedAcquireWriterLockError(
                    `Key "${this.key.resolved}" already acquired`,
                );
            }
        });
    }

    acquireWriterBlocking(
        settings: SharedLockAquireBlockingSettings = {},
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const {
                time = this.defaultBlockingTime,
                interval = this.defaultBlockingInterval,
            } = settings;
            const endDate = time.toEndDate();
            while (endDate > new Date()) {
                const hasAquired = await this.acquireWriter();
                if (hasAquired) {
                    return true;
                }
                await LazyPromise.delay(interval);
            }
            return false;
        });
    }

    acquireWriterBlockingOrFail(
        settings?: SharedLockAquireBlockingSettings,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquireWriterBlocking(settings);
            if (!hasAquired) {
                throw new FailedAcquireWriterLockError(
                    `Key "${this.key.resolved}" already acquired`,
                );
            }
        });
    }

    releaseWriter(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.releaseWriter(
                    this.key.namespaced,
                    this.lockId,
                );

                if (hasReleased) {
                    const event: ReleasedWriterLockEvent = {
                        key: this.key.resolved,
                        lockId: this.lockId,
                        sharedLock: this,
                    };
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.WRITER_RELEASED, event)
                        .defer();
                    return hasReleased;
                }

                const event: FailedReleaseWriterLockEvent = {
                    key: this.key.resolved,
                    lockId: this.lockId,
                    sharedLock: this,
                };
                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.WRITER_FAILED_RELEASE, event)
                    .defer();

                return hasReleased;
            });
        });
    }

    releaseWriterOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasRelased = await this.releaseWriter();
            if (!hasRelased) {
                throw new FailedReleaseWriterLockError(
                    `Unonwed release on key "${this.key.resolved}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    forceReleaseWriter(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.forceReleaseWriter(
                    this.key.namespaced,
                );
                const event: ForceReleasedWriterLockEvent = {
                    key: this.key.resolved,
                    sharedLock: this,
                    hasReleased,
                };
                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.WRITER_FORCE_RELEASED, event)
                    .defer();
                return hasReleased;
            });
        });
    }

    refreshWriter(
        ttl: TimeSpan = this.defaultRefreshTime,
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasRefreshed = await this.adapter.refreshWriter(
                    this.key.namespaced,
                    this.lockId,
                    ttl,
                );

                if (hasRefreshed) {
                    const event: RefreshedWriterLockEvent = {
                        key: this.key.resolved,
                        lockId: this.lockId,
                        newTtl: ttl,
                        sharedLock: this,
                    };
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.WRITER_REFRESHED, event)
                        .defer();
                } else {
                    const event: FailedRefreshWriterLockEvent = {
                        key: this.key.resolved,
                        lockId: this.lockId,
                        sharedLock: this,
                    };
                    this.eventDispatcher
                        .dispatch(
                            SHARED_LOCK_EVENTS.WRITER_FAILED_REFRESH,
                            event,
                        )
                        .defer();
                }

                return hasRefreshed;
            });
        });
    }

    refreshWriterOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasRefreshed = await this.refreshWriter(ttl);
            if (!hasRefreshed) {
                throw new FailedRefreshWriterLockError(
                    `Unonwed refresh on key "${this.key.resolved}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    getId(): string {
        return this.lockId;
    }

    getTtl(): TimeSpan | null {
        return this.ttl;
    }

    getState(): LazyPromise<ISharedLockState | null> {
        throw new Error("Method not implemented.");
    }
}
