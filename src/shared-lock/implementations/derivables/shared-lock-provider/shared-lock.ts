/**
 * @module SharedLock
 */

import { Task } from "@/task/_module-exports.js";
import type { IEventDispatcher } from "@/event-bus/contracts/event-bus.contract.js";
import type { Key, Namespace } from "@/namespace/_module-exports.js";
import {
    FailedAcquireWriterLockError,
    FailedRefreshReaderSemaphoreError,
    FailedRefreshWriterLockError,
    FailedReleaseReaderSemaphoreError,
    FailedReleaseWriterLockError,
    LimitReachedReaderSemaphoreError,
    SHARED_LOCK_EVENTS,
    SHARED_LOCK_STATE,
    SharedLockError,
    type AcquiredWriterLockEvent,
    type FailedRefreshWriterLockEvent,
    type FailedReleaseWriterLockEvent,
    type ForceReleasedWriterLockEvent,
    type IDatabaseSharedLockAdapter,
    type ISharedLock,
    type ISharedLockAdapter,
    type ISharedLockExpiredState,
    type ISharedLockReaderAcquiredState,
    type ISharedLockReaderLimitReachedState,
    type ISharedLockReaderUnacquiredState,
    type ISharedLockState,
    type ISharedLockWriterAcquiredState,
    type ISharedLockWriterUnavailableState,
    type RefreshedWriterLockEvent,
    type ReleasedWriterLockEvent,
    type SharedLockAquireBlockingSettings,
    type SharedLockEventMap,
    type UnavailableSharedLockEvent,
} from "@/shared-lock/contracts/_module-exports.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import {
    resolveLazyable,
    resultFailure,
    resultSuccess,
    UnexpectedError,
    type AsyncLazy,
    type InvokableFn,
    type Result,
} from "@/utilities/_module-exports.js";

/**
 * @internal
 */
export type ISerializedSharedLock = {
    version: "1";
    key: string;
    lockId: string;
    limit: number;
    ttlInMs: number | null;
};

/**
 * @internal
 */
export type SharedLockSettings = {
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
            version: "1",
            key: deserializedValue._key.get(),
            limit: deserializedValue.limit,
            lockId: deserializedValue.lockId,
            ttlInMs: deserializedValue._ttl?.toMilliseconds() ?? null,
        };
    }

    private readonly namespace: Namespace;
    private readonly adapter: ISharedLockAdapter;
    private readonly originalAdapter:
        | IDatabaseSharedLockAdapter
        | ISharedLockAdapter;
    private readonly eventDispatcher: IEventDispatcher<SharedLockEventMap>;
    private readonly _key: Key;
    private readonly lockId: string;
    private _ttl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serdeTransformerName: string;
    private readonly limit: number;

    constructor(settings: SharedLockSettings) {
        const {
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
        this.adapter = adapter;
        this.eventDispatcher = eventDispatcher;
        this._key = key;
        this.lockId = lockId;
        this._ttl = ttl;
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
    ): Task<Result<TValue, LimitReachedReaderSemaphoreError>> {
        return new Task(
            async (): Promise<
                Result<TValue, LimitReachedReaderSemaphoreError>
            > => {
                try {
                    const hasAquired = await this.acquireReader();
                    if (!hasAquired) {
                        return resultFailure(
                            new LimitReachedReaderSemaphoreError(
                                `Key "${this._key.toString()}" already acquired`,
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

    runReaderOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue> {
        return new Task(async () => {
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
    ): Task<Result<TValue, LimitReachedReaderSemaphoreError>> {
        return new Task(
            async (): Promise<
                Result<TValue, LimitReachedReaderSemaphoreError>
            > => {
                try {
                    const hasAquired =
                        await this.acquireReaderBlocking(settings);
                    if (!hasAquired) {
                        return resultFailure(
                            new LimitReachedReaderSemaphoreError(
                                `Key "${this._key.toString()}" has reached the limit ${String(this.limit)}`,
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
    ): Task<TValue> {
        return new Task(async () => {
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
                    sharedLock: this,
                })
                .detach();
            throw error;
        }
    }

    acquireReader(): Task<boolean> {
        return new Task(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasAquired = await this.adapter.acquireReader({
                    key: this._key.get(),
                    lockId: this.lockId,
                    limit: this.limit,
                    ttl: this._ttl,
                });

                if (hasAquired) {
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.READER_ACQUIRED, {
                            sharedLock: this,
                        })
                        .detach();
                } else {
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.UNAVAILABLE, {
                            sharedLock: this,
                        })
                        .detach();
                }

                return hasAquired;
            });
        });
    }

    acquireReaderOrFail(): Task<void> {
        return new Task(async () => {
            const hasAquired = await this.acquireReader();
            if (!hasAquired) {
                throw new LimitReachedReaderSemaphoreError(
                    `Key "${this._key.toString()}" has reached the limit`,
                );
            }
        });
    }

    acquireReaderBlocking(
        settings: SharedLockAquireBlockingSettings = {},
    ): Task<boolean> {
        return new Task(async () => {
            const {
                time = this.defaultBlockingTime,
                interval = this.defaultBlockingInterval,
            } = settings;
            const timeAsTimeSpan = TimeSpan.fromTimeSpan(time);
            const endDate = timeAsTimeSpan.toEndDate();
            while (endDate.getTime() > new Date().getTime()) {
                const hasAquired = await this.acquireReader();
                if (hasAquired) {
                    return true;
                }
                await Task.delay(interval);
            }
            return false;
        });
    }

    acquireReaderBlockingOrFail(
        settings?: SharedLockAquireBlockingSettings,
    ): Task<void> {
        return new Task(async () => {
            const hasAquired = await this.acquireReaderBlocking(settings);
            if (!hasAquired) {
                throw new LimitReachedReaderSemaphoreError(
                    `Key "${this._key.toString()}" has reached the limit`,
                );
            }
        });
    }

    releaseReader(): Task<boolean> {
        return new Task(async () => {
            const hasReleased = await this.adapter.releaseReader(
                this._key.get(),
                this.lockId,
            );
            if (hasReleased) {
                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.READER_RELEASED, {
                        sharedLock: this,
                    })
                    .detach();
            } else {
                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.READER_FAILED_RELEASE, {
                        sharedLock: this,
                    })
                    .detach();
            }
            return hasReleased;
        });
    }

    releaseReaderOrFail(): Task<void> {
        return new Task(async () => {
            const hasReleased = await this.releaseReader();
            if (!hasReleased) {
                throw new FailedReleaseReaderSemaphoreError(
                    `Failed to release lock "${this.lockId}" of key "${this._key.toString()}"`,
                );
            }
        });
    }

    forceReleaseAllReaders(): Task<boolean> {
        return new Task(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.forceReleaseAllReaders(
                    this._key.get(),
                );

                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.READER_ALL_FORCE_RELEASED, {
                        sharedLock: this,
                        hasReleased,
                    })
                    .detach();

                return hasReleased;
            });
        });
    }

    refreshReader(ttl: ITimeSpan = this.defaultRefreshTime): Task<boolean> {
        return new Task(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasRefreshed = await this.adapter.refreshReader(
                    this._key.get(),
                    this.lockId,
                    TimeSpan.fromTimeSpan(ttl),
                );

                if (hasRefreshed) {
                    this._ttl = TimeSpan.fromTimeSpan(ttl);
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.READER_REFRESHED, {
                            sharedLock: this,
                        })
                        .detach();
                } else {
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.READER_FAILED_REFRESH, {
                            sharedLock: this,
                        })
                        .detach();
                }

                return hasRefreshed;
            });
        });
    }

    refreshReaderOrFail(ttl?: TimeSpan): Task<void> {
        return new Task(async () => {
            const hasRefreshed = await this.refreshReader(ttl);
            if (!hasRefreshed) {
                throw new FailedRefreshReaderSemaphoreError(
                    `Failed to refresh lock "${this.lockId}" of key "${this._key.toString()}"`,
                );
            }
        });
    }

    runWriter<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): Task<Result<TValue, FailedAcquireWriterLockError>> {
        return new Task(
            async (): Promise<Result<TValue, FailedAcquireWriterLockError>> => {
                try {
                    const hasAquired = await this.acquireWriter();
                    if (!hasAquired) {
                        return resultFailure(
                            new FailedAcquireWriterLockError(
                                `Key "${this._key.toString()}" already acquired`,
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

    runWriterOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue> {
        return new Task(async () => {
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
    ): Task<Result<TValue, FailedAcquireWriterLockError>> {
        return new Task(
            async (): Promise<Result<TValue, FailedAcquireWriterLockError>> => {
                try {
                    const hasAquired =
                        await this.acquireWriterBlocking(settings);
                    if (!hasAquired) {
                        return resultFailure(
                            new FailedAcquireWriterLockError(
                                `Key "${this._key.toString()}" already acquired`,
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
    ): Task<TValue> {
        return new Task(async () => {
            try {
                await this.acquireWriterBlockingOrFail(settings);

                return await resolveLazyable(asyncFn);
            } finally {
                await this.releaseWriter();
            }
        });
    }

    acquireWriter(): Task<boolean> {
        return new Task(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasAquired = await this.adapter.acquireWriter(
                    this._key.get(),
                    this.lockId,
                    this._ttl,
                );

                if (hasAquired) {
                    const event: AcquiredWriterLockEvent = {
                        sharedLock: this,
                    };
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.WRITER_ACQUIRED, event)
                        .detach();
                    return hasAquired;
                }

                const event: UnavailableSharedLockEvent = {
                    sharedLock: this,
                };
                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.UNAVAILABLE, event)
                    .detach();

                return hasAquired;
            });
        });
    }

    acquireWriterOrFail(): Task<void> {
        return new Task(async () => {
            const hasAquired = await this.acquireWriter();
            if (!hasAquired) {
                throw new FailedAcquireWriterLockError(
                    `Key "${this._key.toString()}" already acquired`,
                );
            }
        });
    }

    acquireWriterBlocking(
        settings: SharedLockAquireBlockingSettings = {},
    ): Task<boolean> {
        return new Task(async () => {
            const {
                time = this.defaultBlockingTime,
                interval = this.defaultBlockingInterval,
            } = settings;
            const timeAsTimeSpan = TimeSpan.fromTimeSpan(time);
            const endDate = timeAsTimeSpan.toEndDate();
            while (endDate > new Date()) {
                const hasAquired = await this.acquireWriter();
                if (hasAquired) {
                    return true;
                }
                await Task.delay(interval);
            }
            return false;
        });
    }

    acquireWriterBlockingOrFail(
        settings?: SharedLockAquireBlockingSettings,
    ): Task<void> {
        return new Task(async () => {
            const hasAquired = await this.acquireWriterBlocking(settings);
            if (!hasAquired) {
                throw new FailedAcquireWriterLockError(
                    `Key "${this._key.toString()}" already acquired`,
                );
            }
        });
    }

    releaseWriter(): Task<boolean> {
        return new Task(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.releaseWriter(
                    this._key.get(),
                    this.lockId,
                );

                if (hasReleased) {
                    const event: ReleasedWriterLockEvent = {
                        sharedLock: this,
                    };
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.WRITER_RELEASED, event)
                        .detach();
                    return hasReleased;
                }

                const event: FailedReleaseWriterLockEvent = {
                    sharedLock: this,
                };
                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.WRITER_FAILED_RELEASE, event)
                    .detach();

                return hasReleased;
            });
        });
    }

    releaseWriterOrFail(): Task<void> {
        return new Task(async () => {
            const hasRelased = await this.releaseWriter();
            if (!hasRelased) {
                throw new FailedReleaseWriterLockError(
                    `Unonwed release on key "${this._key.toString()}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    forceReleaseWriter(): Task<boolean> {
        return new Task(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.forceReleaseWriter(
                    this._key.get(),
                );
                const event: ForceReleasedWriterLockEvent = {
                    sharedLock: this,
                    hasReleased,
                };
                this.eventDispatcher
                    .dispatch(SHARED_LOCK_EVENTS.WRITER_FORCE_RELEASED, event)
                    .detach();
                return hasReleased;
            });
        });
    }

    refreshWriter(ttl: ITimeSpan = this.defaultRefreshTime): Task<boolean> {
        return new Task(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasRefreshed = await this.adapter.refreshWriter(
                    this._key.get(),
                    this.lockId,
                    TimeSpan.fromTimeSpan(ttl),
                );

                if (hasRefreshed) {
                    this._ttl = TimeSpan.fromTimeSpan(ttl);
                    const event: RefreshedWriterLockEvent = {
                        sharedLock: this,
                    };
                    this.eventDispatcher
                        .dispatch(SHARED_LOCK_EVENTS.WRITER_REFRESHED, event)
                        .detach();
                } else {
                    const event: FailedRefreshWriterLockEvent = {
                        sharedLock: this,
                    };
                    this.eventDispatcher
                        .dispatch(
                            SHARED_LOCK_EVENTS.WRITER_FAILED_REFRESH,
                            event,
                        )
                        .detach();
                }

                return hasRefreshed;
            });
        });
    }

    refreshWriterOrFail(ttl?: TimeSpan): Task<void> {
        return new Task(async () => {
            const hasRefreshed = await this.refreshWriter(ttl);
            if (!hasRefreshed) {
                throw new FailedRefreshWriterLockError(
                    `Unonwed refresh on key "${this._key.toString()}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    get key(): string {
        return this._key.toString();
    }

    get id(): string {
        return this.lockId;
    }

    get ttl(): TimeSpan | null {
        return this._ttl;
    }

    forceRelease(): Task<boolean> {
        return new Task(async () => {
            return await this.handleUnexpectedError(async () => {
                return await this.adapter.forceRelease(this._key.get());
            });
        });
    }

    getState(): Task<ISharedLockState> {
        return new Task<ISharedLockState>(async () => {
            return await this.handleUnexpectedError(async () => {
                const state = await this.adapter.getState(this._key.get());
                if (state === null) {
                    return {
                        type: SHARED_LOCK_STATE.EXPIRED,
                    } satisfies ISharedLockExpiredState;
                }

                if (state.writer && state.writer.owner === this.lockId) {
                    return {
                        type: SHARED_LOCK_STATE.WRITER_ACQUIRED,
                        remainingTime:
                            state.writer.expiration === null
                                ? null
                                : TimeSpan.fromDateRange(
                                      new Date(),
                                      state.writer.expiration,
                                  ),
                    } satisfies ISharedLockWriterAcquiredState;
                }

                if (state.writer && state.writer.owner !== this.lockId) {
                    return {
                        type: SHARED_LOCK_STATE.WRITER_UNAVAILABLE,
                        owner: state.writer.owner,
                    } satisfies ISharedLockWriterUnavailableState;
                }

                if (
                    state.reader !== null &&
                    state.reader.acquiredSlots.size >= state.reader.limit
                ) {
                    return {
                        type: SHARED_LOCK_EVENTS.READER_LIMIT_REACHED,
                        limit: state.reader.limit,
                        acquiredSlots: [...state.reader.acquiredSlots.keys()],
                    } satisfies ISharedLockReaderLimitReachedState;
                }

                const slotExpiration = state.reader?.acquiredSlots.get(
                    this.lockId,
                );
                if (state.reader !== null && slotExpiration === undefined) {
                    return {
                        type: SHARED_LOCK_STATE.READER_UNACQUIRED,
                        limit: state.reader.limit,
                        freeSlotsCount:
                            state.reader.limit -
                            state.reader.acquiredSlots.size,
                        acquiredSlotsCount: state.reader.acquiredSlots.size,
                        acquiredSlots: [...state.reader.acquiredSlots.keys()],
                    } satisfies ISharedLockReaderUnacquiredState;
                }

                if (state.reader !== null && slotExpiration !== undefined) {
                    return {
                        type: SHARED_LOCK_STATE.READER_ACQUIRED,
                        acquiredSlots: [...state.reader.acquiredSlots.keys()],
                        acquiredSlotsCount: state.reader.acquiredSlots.size,
                        freeSlotsCount:
                            state.reader.limit -
                            state.reader.acquiredSlots.size,
                        limit: state.reader.limit,
                        remainingTime:
                            slotExpiration === null
                                ? null
                                : TimeSpan.fromDateRange(
                                      new Date(),
                                      slotExpiration,
                                  ),
                    } satisfies ISharedLockReaderAcquiredState;
                }

                throw new UnexpectedError(
                    "Invalid ISharedLockAdapterState, expected either the reader field must be defined or the writer field must be defined, but not both.",
                );
            });
        });
    }
}
