/**
 * @module Lock
 */

import {
    type AsyncLazy,
    type Result,
    resolveLazyable,
    resultSuccess,
    resultFailure,
} from "@/utilities/_module-exports.js";
import type {
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
    LOCK_STATE,
    isLockError,
} from "@/lock/contracts/_module-exports.js";
import {
    type ILock,
    type ILockAdapter,
} from "@/lock/contracts/_module-exports.js";
import { Task } from "@/task/_module-exports.js";
import type { IEventDispatcher } from "@/event-bus/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import type { Key, Namespace } from "@/namespace/_module-exports.js";
import type { AsyncMiddlewareFn } from "@/hooks/_module-exports.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";

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
        return new Task(
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
        return new Task(async () => {
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
        return new Task(
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
        return new Task(async () => {
            try {
                await this.acquireBlockingOrFail(settings);

                return await resolveLazyable(asyncFn);
            } finally {
                await this.release();
            }
        });
    }

    private handleUnexpectedError = <
        TParameters extends unknown[],
        TReturn,
    >(): AsyncMiddlewareFn<TParameters, TReturn> => {
        return async (args, next) => {
            try {
                return await next(...args);
            } catch (error: unknown) {
                if (isLockError(error)) {
                    throw error;
                }

                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, {
                        error,
                        lock: this,
                    })
                    .detach();

                throw error;
            }
        };
    };

    private handleDispatch = <
        TParameters extends unknown[],
        TEventName extends keyof LockEventMap,
        TEvent extends LockEventMap[TEventName],
    >(settings: {
        on: "true" | "false";
        eventName: TEventName;
        eventData: TEvent;
    }): AsyncMiddlewareFn<TParameters, boolean> => {
        return async (args, next) => {
            const result = await next(...args);
            if (result && settings.on === "true") {
                this.eventDispatcher
                    .dispatch(settings.eventName, settings.eventData)
                    .detach();
            }
            if (!result && settings.on === "false") {
                this.eventDispatcher
                    .dispatch(settings.eventName, settings.eventData)
                    .detach();
            }
            return result;
        };
    };

    acquire(): Task<boolean> {
        return new Task(async () => {
            return await this.adapter.acquire(
                this._key.toString(),
                this.lockId,
                this._ttl,
            );
        }).pipe([
            this.handleUnexpectedError(),
            this.handleDispatch({
                on: "true",
                eventName: LOCK_EVENTS.ACQUIRED,
                eventData: {
                    lock: this,
                },
            }),
            this.handleDispatch({
                on: "false",
                eventName: LOCK_EVENTS.UNAVAILABLE,
                eventData: {
                    lock: this,
                },
            }),
        ]);
    }

    acquireOrFail(): Task<void> {
        return new Task(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new FailedAcquireLockError(
                    `Key "${this._key.get()}" already acquired`,
                );
            }
        });
    }

    acquireBlocking(settings: LockAquireBlockingSettings = {}): Task<boolean> {
        return new Task(async () => {
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

    acquireBlockingOrFail(settings?: LockAquireBlockingSettings): Task<void> {
        return new Task(async () => {
            const hasAquired = await this.acquireBlocking(settings);
            if (!hasAquired) {
                throw new FailedAcquireLockError(
                    `Key "${this._key.get()}" already acquired`,
                );
            }
        });
    }

    release(): Task<boolean> {
        return new Task(async () => {
            return await this.adapter.release(
                this._key.toString(),
                this.lockId,
            );
        }).pipe([
            this.handleUnexpectedError(),
            this.handleDispatch({
                on: "true",
                eventName: LOCK_EVENTS.RELEASED,
                eventData: {
                    lock: this,
                },
            }),
            this.handleDispatch({
                on: "false",
                eventName: LOCK_EVENTS.FAILED_RELEASE,
                eventData: {
                    lock: this,
                },
            }),
        ]);
    }

    releaseOrFail(): Task<void> {
        return new Task(async () => {
            const hasRelased = await this.release();
            if (!hasRelased) {
                throw new FailedReleaseLockError(
                    `Unonwed release on key "${this._key.get()}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    forceRelease(): Task<boolean> {
        return new Task(async () => {
            return await this.adapter.forceRelease(this._key.toString());
        }).pipe([
            this.handleUnexpectedError(),
            async (args, next) => {
                const hasReleased = await next(...args);
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.FORCE_RELEASED, {
                        lock: this,
                        hasReleased,
                    })
                    .detach();
                return hasReleased;
            },
        ]);
    }

    refresh(ttl: ITimeSpan = this.defaultRefreshTime): Task<boolean> {
        return new Task(async () => {
            return await this.adapter.refresh(
                this._key.toString(),
                this.lockId,
                TimeSpan.fromTimeSpan(ttl),
            );
        }).pipe([
            this.handleUnexpectedError(),
            this.handleDispatch({
                on: "true",
                eventName: LOCK_EVENTS.REFRESHED,
                eventData: {
                    lock: this,
                },
            }),
            this.handleDispatch({
                on: "false",
                eventName: LOCK_EVENTS.FAILED_REFRESH,
                eventData: {
                    lock: this,
                },
            }),
            async (args, next) => {
                const hasRefreshed = await next(...args);
                if (hasRefreshed) {
                    this._ttl = TimeSpan.fromTimeSpan(ttl);
                }
                return hasRefreshed;
            },
        ]);
    }

    refreshOrFail(ttl?: ITimeSpan): Task<void> {
        return new Task(async () => {
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
        return new Task(async () => {
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
                            : TimeSpan.fromDateRange({
                                  start: new Date(),
                                  end: state.expiration,
                              }),
                } satisfies ILockAcquiredState;
            }
            return {
                type: LOCK_STATE.UNAVAILABLE,
                owner: state.owner,
            } satisfies ILockUnavailableState;
        }).pipe(this.handleUnexpectedError());
    }
}
