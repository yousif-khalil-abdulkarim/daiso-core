/**
 * @module Lock
 */

import { TimeSpan } from "@/utilities/_module-exports.js";
import {
    type Key,
    type AsyncLazy,
    type OneOrMore,
    type Result,
    resolveLazyable,
    resultSuccess,
    resultFailure,
} from "@/utilities/_module-exports.js";
import { resolveOneOrMoreStr } from "@/utilities/_module-exports.js";
import type {
    AcquiredLockEvent,
    UnavailableLockEvent,
    ReleasedLockEvent,
    UnownedReleaseTryLockEvent,
    ForceReleasedLockEvent,
    RefreshedLockEvent,
    UnownedRefreshTryLockEvent,
    UnexpectedErrorLockEvent,
    LockRefreshResult,
    UnexpireableKeyRefreshTryLockEvent,
} from "@/lock/contracts/_module-exports.js";
import {
    KeyAlreadyAcquiredLockError,
    LOCK_EVENTS,
    LOCK_REFRESH_RESULT,
    UnownedRefreshLockError,
    UnownedReleaseLockError,
    UnrefreshableKeyLockError,
    type LockAquireBlockingSettings,
    type LockEventMap,
} from "@/lock/contracts/_module-exports.js";
import {
    type ILock,
    type ILockAdapter,
} from "@/lock/contracts/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type { IEventDispatcher } from "@/event-bus/contracts/_module-exports.js";

import type { LockState } from "@/lock/implementations/derivables/lock-provider/lock-state.js";

/**
 * @internal
 */
export type ISerializedLock = {
    key: string;
    expirationInMs: number | null;
    owner: string;
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
    adapter: ILockAdapter;
    lockState: LockState;
    eventDispatcher: IEventDispatcher<LockEventMap>;
    key: Key;
    owner: OneOrMore<string>;
    ttl: TimeSpan | null;
    expirationInMs?: number | null;
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
            expirationInMs:
                deserializedValue.lockState.get()?.toEndDate().getTime() ??
                null,
            owner: deserializedValue.owner,
            ttlInMs: deserializedValue.ttl?.toMilliseconds() ?? null,
        };
    }

    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => Promise<TValue>,
    ) => LazyPromise<TValue>;
    private readonly adapter: ILockAdapter;
    private readonly lockState: LockState;
    private readonly eventDispatcher: IEventDispatcher<LockEventMap>;
    private readonly key: Key;
    private readonly owner: string;
    private readonly ttl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly serdeTransformerName: string;

    constructor(settings: LockSettings) {
        const {
            createLazyPromise,
            adapter,
            lockState,
            eventDispatcher,
            key,
            owner,
            ttl,
            serdeTransformerName,
            expirationInMs,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
        } = settings;
        this.serdeTransformerName = serdeTransformerName;
        this.createLazyPromise = createLazyPromise;
        this.adapter = adapter;
        this.lockState = lockState;
        if (expirationInMs !== undefined && expirationInMs === null) {
            this.lockState.set(null);
        }
        if (expirationInMs !== undefined && expirationInMs !== null) {
            this.lockState.set(
                TimeSpan.fromDateRange(new Date(), new Date(expirationInMs)),
            );
        }
        this.eventDispatcher = eventDispatcher;
        this.key = key;
        this.owner = resolveOneOrMoreStr(owner);
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
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, KeyAlreadyAcquiredLockError>> => {
                try {
                    const hasAquired = await this.acquire();
                    if (!hasAquired) {
                        return resultFailure(
                            new KeyAlreadyAcquiredLockError(
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
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, KeyAlreadyAcquiredLockError>> => {
                try {
                    const hasAquired = await this.acquireBlocking(settings);
                    if (!hasAquired) {
                        return resultFailure(
                            new KeyAlreadyAcquiredLockError(
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

    acquire(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            try {
                const hasAquired = await this.adapter.acquire(
                    this.key.namespaced,
                    this.owner,
                    this.ttl,
                );
                this.lockState.remove();
                if (hasAquired) {
                    this.lockState.set(this.ttl);
                    const event: AcquiredLockEvent = {
                        key: this.key.resolved,
                        owner: this.owner,
                        ttl: this.ttl,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.ACQUIRED, event)
                        .defer();
                } else {
                    const event: UnavailableLockEvent = {
                        key: this.key.resolved,
                        owner: this.owner,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.UNAVAILABLE, event)
                        .defer();
                }
                return hasAquired;
            } catch (error: unknown) {
                const event: UnexpectedErrorLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();

                throw error;
            }
        });
    }

    acquireOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new KeyAlreadyAcquiredLockError(
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
                throw new KeyAlreadyAcquiredLockError(
                    `Key "${this.key.resolved}" already acquired`,
                );
            }
        });
    }

    release(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            try {
                const hasReleased = await this.adapter.release(
                    this.key.namespaced,
                    this.owner,
                );
                if (hasReleased) {
                    this.lockState.remove();
                    const event: ReleasedLockEvent = {
                        key: this.key.resolved,
                        owner: this.owner,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.RELEASED, event)
                        .defer();
                } else {
                    const event: UnownedReleaseTryLockEvent = {
                        key: this.key.resolved,
                        owner: this.owner,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.UNOWNED_RELEASE_TRY, event)
                        .defer();
                }
                return hasReleased;
            } catch (error: unknown) {
                const event: UnexpectedErrorLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw error;
            }
        });
    }

    releaseOrFail(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasRelased = await this.release();
            if (!hasRelased) {
                throw new UnownedReleaseLockError(
                    `Unonwed release on key "${this.key.resolved}" by owner "${this.owner}"`,
                );
            }
        });
    }

    forceRelease(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            try {
                const hasRelased = await this.adapter.forceRelease(
                    this.key.namespaced,
                );
                this.lockState.remove();
                if (hasRelased) {
                    const event: ForceReleasedLockEvent = {
                        key: this.key.resolved,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.FORCE_RELEASED, event)
                        .defer();
                }
                return hasRelased;
            } catch (error: unknown) {
                const event: UnexpectedErrorLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw error;
            }
        });
    }

    isExpired(): LazyPromise<boolean> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            try {
                return this.lockState.isExpired();
            } catch (error: unknown) {
                const event: UnexpectedErrorLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw error;
            }
        });
    }

    isLocked(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const isExpired = await this.isExpired();
            return !isExpired;
        });
    }

    private async _refresh(
        ttl: TimeSpan = this.defaultRefreshTime,
    ): Promise<LockRefreshResult> {
        try {
            const result = await this.adapter.refresh(
                this.key.namespaced,
                this.owner,
                ttl,
            );
            if (result === LOCK_REFRESH_RESULT.REFRESHED) {
                const event: RefreshedLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl,
                };
                this.lockState.set(ttl);
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.REFRESHED, event)
                    .defer();
            } else if (result === LOCK_REFRESH_RESULT.UNOWNED_REFRESH) {
                const event: UnownedRefreshTryLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNOWNED_REFRESH_TRY, event)
                    .defer();
            } else {
                const event: UnexpireableKeyRefreshTryLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPIREABLE_KEY_REFRESH_TRY, event)
                    .defer();
            }
            return result;
        } catch (error: unknown) {
            const event: UnexpectedErrorLockEvent = {
                key: this.key.resolved,
                owner: this.owner,
                ttl: this.ttl,
                error,
            };
            this.eventDispatcher
                .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                .defer();
            throw error;
        }
    }

    refresh(ttl: TimeSpan = this.defaultRefreshTime): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const result = await this._refresh(ttl);
            return result === LOCK_REFRESH_RESULT.REFRESHED;
        });
    }

    refreshOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const result = await this._refresh(ttl);
            if (result === LOCK_REFRESH_RESULT.UNOWNED_REFRESH) {
                throw new UnownedRefreshLockError(
                    `Unonwed refresh on key "${this.key.resolved}" by owner "${this.owner}"`,
                );
            }
            if (result === LOCK_REFRESH_RESULT.UNEXPIRABLE_KEY) {
                throw new UnrefreshableKeyLockError(
                    `Key "${this.key.resolved}" is not`,
                );
            }
        });
    }

    getRemainingTime(): LazyPromise<TimeSpan | null> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            try {
                return this.lockState.get();
            } catch (error: unknown) {
                const event: UnexpectedErrorLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw error;
            }
        });
    }

    getOwner(): LazyPromise<string> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            try {
                return this.owner;
            } catch (error: unknown) {
                const event: UnexpectedErrorLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw error;
            }
        });
    }
}
