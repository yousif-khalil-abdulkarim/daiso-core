/**
 * @module Lock
 */

import type { Key } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import {
    type InvokableFn,
    type Namespace,
} from "@/utilities/_module-exports.js";
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
import { LazyPromise } from "@/async/_module-exports.js";
import type { IEventDispatcher } from "@/event-bus/contracts/_module-exports.js";

/**
 * @internal
 */
export type ISerializedLock = {
    key: string;
    lockId: string;
    ttlInMs: number | null;
};

/**
 * @internal
 */
export type LockSettings = {
    createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
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
            key: deserializedValue._key.resolved,
            lockId: deserializedValue.lockId,
            ttlInMs: deserializedValue._ttl?.toMilliseconds() ?? null,
        };
    }

    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
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
        } = settings;
        this.namespace = namespace;
        this.originalAdapter = originalAdapter;
        this.serdeTransformerName = serdeTransformerName;
        this.createLazyPromise = createLazyPromise;
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
    ): LazyPromise<Result<TValue, FailedAcquireLockError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, FailedAcquireLockError>> => {
                try {
                    const hasAquired = await this.acquire();
                    if (!hasAquired) {
                        return resultFailure(
                            new FailedAcquireLockError(
                                `Key "${this._key.resolved}" already acquired`,
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
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<Result<TValue, FailedAcquireLockError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, FailedAcquireLockError>> => {
                try {
                    const hasAquired = await this.acquireBlocking(settings);
                    if (!hasAquired) {
                        return resultFailure(
                            new FailedAcquireLockError(
                                `Key "${this._key.resolved}" already acquired`,
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
            if (error instanceof LockError) {
                throw error;
            }
            const event: UnexpectedErrorLockEvent = {
                error,
                lock: this,
            };
            this.eventDispatcher
                .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                .defer();

            throw error;
        }
    }

    acquire(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasAquired = await this.adapter.acquire(
                    this._key.namespaced,
                    this.lockId,
                    this._ttl,
                );

                if (hasAquired) {
                    const event: AcquiredLockEvent = {
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.ACQUIRED, event)
                        .defer();
                    return hasAquired;
                }

                const event: UnavailableLockEvent = {
                    lock: this,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNAVAILABLE, event)
                    .defer();

                return hasAquired;
            });
        });
    }

    acquireOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new FailedAcquireLockError(
                    `Key "${this._key.resolved}" already acquired`,
                );
            }
        });
    }

    acquireBlocking(
        settings: LockAquireBlockingSettings = {},
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const {
                time = this.defaultBlockingTime,
                interval = this.defaultBlockingInterval,
            } = settings;
            const endDate = time.toEndDate();
            while (endDate > new Date()) {
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
        settings?: LockAquireBlockingSettings,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquireBlocking(settings);
            if (!hasAquired) {
                throw new FailedAcquireLockError(
                    `Key "${this._key.resolved}" already acquired`,
                );
            }
        });
    }

    release(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.release(
                    this._key.namespaced,
                    this.lockId,
                );

                if (hasReleased) {
                    const event: ReleasedLockEvent = {
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.RELEASED, event)
                        .defer();
                    return hasReleased;
                }

                const event: FailedReleaseLockEvent = {
                    lock: this,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.FAILED_RELEASE, event)
                    .defer();

                return hasReleased;
            });
        });
    }

    releaseOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasRelased = await this.release();
            if (!hasRelased) {
                throw new FailedReleaseLockError(
                    `Unonwed release on key "${this._key.resolved}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    forceRelease(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.forceRelease(
                    this._key.namespaced,
                );
                const event: ForceReleasedLockEvent = {
                    lock: this,
                    hasReleased,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.FORCE_RELEASED, event)
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
                        .defer();
                } else {
                    const event: FailedRefreshLockEvent = {
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.FAILED_REFRESH, event)
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
                throw new FailedRefreshLockError(
                    `Unonwed refresh on key "${this._key.resolved}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    get key(): string {
        return this._key.resolved;
    }

    get id(): string {
        return this.lockId;
    }

    get ttl(): TimeSpan | null {
        return this._ttl;
    }

    getState(): LazyPromise<ILockState> {
        return this.createLazyPromise(async () => {
            const state = await this.adapter.getState(this._key.namespaced);
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
    }
}
