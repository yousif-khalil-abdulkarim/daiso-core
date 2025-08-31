/**
 * @module Lock
 */

import type {
    InvokableFn,
    Namespace,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import {
    type Key,
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
} from "@/lock/contracts/_module-exports.js";
import {
    FailedAcquireLockError,
    LOCK_EVENTS,
    FailedReleaseLockError,
    FailedRefreshLockError,
    type LockAquireBlockingSettings,
    type LockEventMap,
    LockError,
} from "@/lock/contracts/_module-exports.js";
import {
    type ILock,
    type ILockAdapter,
} from "@/lock/contracts/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type { IEventDispatcher } from "@/event-bus/contracts/_module-exports.js";
import { LockState } from "@/lock/implementations/derivables/lock-provider/lock-state.js";

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
            key: deserializedValue.key.resolved,
            lockId: deserializedValue.lockId,
            ttlInMs: deserializedValue.ttl?.toMilliseconds() ?? null,
        };
    }

    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    private readonly namespace: Namespace;
    private readonly adapter: ILockAdapter;
    private readonly originalAdapter: IDatabaseLockAdapter | ILockAdapter;
    private readonly eventDispatcher: IEventDispatcher<LockEventMap>;
    private readonly key: Key;
    private readonly lockId: string;
    private readonly ttl: TimeSpan | null;
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
                                `Key "${this.key.resolved}" already acquired`,
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
                                `Key "${this.key.resolved}" already acquired`,
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
                key: this.key.resolved,
                lockId: this.lockId,
                ttl: this.ttl,
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
                    this.key.namespaced,
                    this.lockId,
                    this.ttl,
                );

                if (hasAquired) {
                    const event: AcquiredLockEvent = {
                        key: this.key.resolved,
                        lockId: this.lockId,
                        ttl: this.ttl,
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.ACQUIRED, event)
                        .defer();
                    return hasAquired;
                }

                const event: UnavailableLockEvent = {
                    key: this.key.resolved,
                    lockId: this.lockId,
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
                    `Key "${this.key.resolved}" already acquired`,
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
                    `Key "${this.key.resolved}" already acquired`,
                );
            }
        });
    }

    release(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.release(
                    this.key.namespaced,
                    this.lockId,
                );

                if (hasReleased) {
                    const event: ReleasedLockEvent = {
                        key: this.key.resolved,
                        lockId: this.lockId,
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.RELEASED, event)
                        .defer();
                    return hasReleased;
                }

                const event: FailedReleaseLockEvent = {
                    key: this.key.resolved,
                    lockId: this.lockId,
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
                    `Unonwed release on key "${this.key.resolved}" by owner "${this.lockId}"`,
                );
            }
        });
    }

    forceRelease(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.handleUnexpectedError(async () => {
                const hasReleased = await this.adapter.forceRelease(
                    this.key.namespaced,
                );
                const event: ForceReleasedLockEvent = {
                    key: this.key.resolved,
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
                    this.key.namespaced,
                    this.lockId,
                    ttl,
                );

                if (hasRefreshed) {
                    const event: RefreshedLockEvent = {
                        key: this.key.resolved,
                        lockId: this.lockId,
                        newTtl: ttl,
                        lock: this,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.REFRESHED, event)
                        .defer();
                } else {
                    const event: FailedRefreshLockEvent = {
                        key: this.key.resolved,
                        lockId: this.lockId,
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

    getState(): LazyPromise<ILockState | null> {
        return this.createLazyPromise<ILockState | null>(async () => {
            const state = await this.adapter.getState(this.key.namespaced);
            if (state === null) {
                return null;
            }
            return new LockState(state, this.lockId);
        });
    }
}
