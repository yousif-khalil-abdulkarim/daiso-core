/**
 * @module Lock
 */

import { type InvokableFn } from "@/utilities/_module-exports.js";
import {
    type AsyncLazy,
    type Result,
    resolveLazyable,
    resultSuccess,
    resultFailure,
} from "@/utilities/_module-exports.js";
import type {
    AcquiredLockEvent,
    UnavailableLockEvent,
    ReleasedLockEvent,
    FailedReleaseLockEvent,
    ForceReleasedLockEvent,
    RefreshedLockEvent,
    FailedRefreshLockEvent,
    UnexpectedErrorLockEvent,
    ILockState,
    IDatabaseLockAdapter,
    ILockExpiredState,
    ILockAcquiredState,
    ILockUnavailableState,
} from "@/lock/contracts/_module-exports.js";
import {
    FailedAcquireLockError,
    LOCK_EVENTS,
    FailedReleaseLockError,
    FailedRefreshLockError,
    type LockAquireBlockingSettings,
    type LockEventMap,
    LockError,
    LOCK_STATE,
} from "@/lock/contracts/_module-exports.js";
import {
    type ILock,
    type ILockAdapter,
} from "@/lock/contracts/_module-exports.js";
import { Task } from "@/task/_module-exports.js";
import type { IEventDispatcher } from "@/event-bus/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import type { Key, Namespace } from "@/namespace/_module-exports.js";

/**
 * @internal
 */
export type ISerializedLock = {
    version: "1";
    key: string;
    lockId: string;
    ttlInMs: number | null;
};

/**
 * @internal
 */
export type LockSettings = {
    createTask: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => Task<TValue>;
    serdeTransformerName: string;
    namespace: Namespace;
    adapter: ILockAdapter;
    originalAdapter: IDatabaseLockAdapter | ILockAdapter;
    eventDispatcher: IEventDispatcher<LockEventMap>;
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
export class Lock implements ILock {
    /**
     * @internal
     */
    static _internal_serialize(deserializedValue: Lock): ISerializedLock {
        return {
            version: "1",
            key: deserializedValue._key.get(),
            lockId: deserializedValue.lockId,
            ttlInMs: deserializedValue._ttl?.toMilliseconds() ?? null,
        };
    }

    private readonly createTask: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => Task<TValue>;
    private readonly namespace: Namespace;
    private readonly adapter: ILockAdapter;
    private readonly originalAdapter: IDatabaseLockAdapter | ILockAdapter;
    private readonly eventDispatcher: IEventDispatcher<LockEventMap>;
    private readonly _key: Key;
    private readonly lockId: string;
    private _ttl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serdeTransformerName: string;

    constructor(settings: LockSettings) {
        const {
            createTask,
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
        } = settings;
        this.namespace = namespace;
        this.originalAdapter = originalAdapter;
        this.serdeTransformerName = serdeTransformerName;
        this.createTask = createTask;
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

    _internal_getAdapter(): IDatabaseLockAdapter | ILockAdapter {
        return this.originalAdapter;
    }

    run<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
    ): Task<Result<TValue, FailedAcquireLockError>> {
        return this.createTask(
            async (): Promise<Result<TValue, FailedAcquireLockError>> => {
                try {
                    const hasAquired = await this.acquire();
                    if (!hasAquired) {
                        return resultFailure(
                            new FailedAcquireLockError(
                                `Key "${this._key.get()}" already acquired`,
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

    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): Task<TValue> {
        return this.createTask(async () => {
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
        settings?: LockAquireBlockingSettings,
    ): Task<Result<TValue, FailedAcquireLockError>> {
        return this.createTask(
            async (): Promise<Result<TValue, FailedAcquireLockError>> => {
                try {
                    const hasAquired = await this.acquireBlocking(settings);
                    if (!hasAquired) {
                        return resultFailure(
                            new FailedAcquireLockError(
                                `Key "${this._key.get()}" already acquired`,
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
        settings?: LockAquireBlockingSettings,
    ): Task<TValue> {
        return this.createTask(async () => {
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
            if (error instanceof LockError) {
                throw error;
            }
            const event: UnexpectedErrorLockEvent = {
                error,
                lock: this,
            };
            this.eventDispatcher
                .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                .detach();

            throw error;
        }
    }

    acquire(): Task<boolean> {
        return this.createTask(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasAquired = await this.adapter.acquire(
                    this._key.toString(),
                    this.lockId,
                    this._ttl,
                );

                if (hasAquired) {
                    const event: AcquiredLockEvent = {
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.ACQUIRED, event)
                        .detach();
                    return hasAquired;
                }

                const event: UnavailableLockEvent = {
                    lock: this,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNAVAILABLE, event)
                    .detach();

                return hasAquired;
            });
        });
    }

    acquireOrFail(): Task<void> {
        return this.createTask(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new FailedAcquireLockError(
                    `Key "${this._key.get()}" already acquired`,
                );
            }
        });
    }

    acquireBlocking(
        settings: LockAquireBlockingSettings = {},
    ): Task<boolean> {
        return this.createTask(async () => {
            const {
                time = this.defaultBlockingTime,
                interval = this.defaultBlockingInterval,
            } = settings;

            const timeAsTimeSpan = TimeSpan.fromTimeSpan(time);
            const intervalAsTimeSpan = TimeSpan.fromTimeSpan(interval);
            const endDate = timeAsTimeSpan.toEndDate();
            while (endDate > new Date()) {
                const hasAquired = await this.acquire();
                if (hasAquired) {
                    return true;
                }
                await Task.delay(intervalAsTimeSpan);
            }
            return false;
        });
    }

    acquireBlockingOrFail(
        settings?: LockAquireBlockingSettings,
    ): Task<void> {
        return this.createTask(async () => {
            const hasAquired = await this.acquireBlocking(settings);
            if (!hasAquired) {
                throw new FailedAcquireLockError(
                    `Key "${this._key.get()}" already acquired`,
                );
            }
        });
    }

    release(): Task<boolean> {
        return this.createTask(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.release(
                    this._key.toString(),
                    this.lockId,
                );

                if (hasReleased) {
                    const event: ReleasedLockEvent = {
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.RELEASED, event)
                        .detach();
                    return hasReleased;
                }

                const event: FailedReleaseLockEvent = {
                    lock: this,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.FAILED_RELEASE, event)
                    .detach();

                return hasReleased;
            });
        });
    }

    releaseOrFail(): Task<void> {
        return this.createTask(async () => {
            const hasRelased = await this.release();
            if (!hasRelased) {
                throw new FailedReleaseLockError(
                    `Unonwed release on key "${this._key.get()}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    forceRelease(): Task<boolean> {
        return this.createTask(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.forceRelease(
                    this._key.toString(),
                );
                const event: ForceReleasedLockEvent = {
                    lock: this,
                    hasReleased,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.FORCE_RELEASED, event)
                    .detach();
                return hasReleased;
            });
        });
    }

    refresh(ttl: TimeSpan = this.defaultRefreshTime): Task<boolean> {
        return this.createTask(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasRefreshed = await this.adapter.refresh(
                    this._key.toString(),
                    this.lockId,
                    ttl,
                );

                if (hasRefreshed) {
                    this._ttl = ttl;
                    const event: RefreshedLockEvent = {
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.REFRESHED, event)
                        .detach();
                } else {
                    const event: FailedRefreshLockEvent = {
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.FAILED_REFRESH, event)
                        .detach();
                }

                return hasRefreshed;
            });
        });
    }

    refreshOrFail(ttl?: TimeSpan): Task<void> {
        return this.createTask(async () => {
            const hasRefreshed = await this.refresh(ttl);
            if (!hasRefreshed) {
                throw new FailedRefreshLockError(
                    `Unonwed refresh on key "${this._key.get()}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    get key(): string {
        return this._key.get();
    }

    get id(): string {
        return this.lockId;
    }

    get ttl(): TimeSpan | null {
        return this._ttl;
    }

    getState(): Task<ILockState> {
        return this.createTask(async () => {
            return await this.handleUnexpectedError(async () => {
                const state = await this.adapter.getState(this._key.toString());
                if (state === null) {
                    return {
                        type: LOCK_STATE.EXPIRED,
                    } satisfies ILockExpiredState;
                }
                if (state.owner === this.lockId) {
                    return {
                        type: LOCK_STATE.ACQUIRED,
                        remainingTime:
                            state.expiration === null
                                ? null
                                : TimeSpan.fromDateRange(
                                      new Date(),
                                      state.expiration,
                                  ),
                    } satisfies ILockAcquiredState;
                }
                return {
                    type: LOCK_STATE.UNAVAILABLE,
                    owner: state.owner,
                } satisfies ILockUnavailableState;
            });
        });
    }
}
