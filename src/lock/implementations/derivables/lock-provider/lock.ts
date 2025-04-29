/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    type Key,
    type AsyncLazy,
    type OneOrMore,
    type Result,
    resolveLazyable,
} from "@/utilities/_module-exports.js";
import { resolveOneOrMoreStr } from "@/utilities/_module-exports.js";
import type {
    AcquiredLockEvent,
    NotAvailableLockEvent,
    ReleasedLockEvent,
    UnownedReleaseTryLockEvent,
    ForceReleasedLockEvent,
    RefreshedLockEvent,
    UnownedRefreshTryLockEvent,
    UnexpectedErrorLockEvent,
} from "@/lock/contracts/_module-exports.js";
import {
    KeyAlreadyAcquiredLockError,
    LOCK_EVENTS,
    UnableToAquireLockError,
    UnableToReleaseLockError,
    UnownedRefreshLockError,
    UnownedReleaseLockError,
    type AquireBlockingSettings,
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
    key: OneOrMore<string>;
    owner: string;
    ttlInMs: number | null;
    expirationInMs: number | null;
};

/**
 * @internal
 */
export type LockSettings = {
    createLazyPromise: <TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ) => LazyPromise<TValue>;
    serdeTransformerName: string;
    adapter: ILockAdapter;
    lockState: LockState;
    eventDispatcher: IEventDispatcher<LockEventMap>;
    key: Key;
    owner: OneOrMore<string>;
    ttl: TimeSpan | null;
    expirationInMs: number | null;
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
    static serialize(deserializedValue: Lock): ISerializedLock {
        return {
            key: deserializedValue.key.resolved,
            owner: deserializedValue.owner,
            ttlInMs: deserializedValue.ttl?.toMilliseconds() ?? null,
            expirationInMs:
                deserializedValue.lockState.get()?.getTime() ?? null,
        };
    }

    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
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

    /**
     * @internal
     */
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
        this.lockState.set(expirationInMs);
        this.eventDispatcher = eventDispatcher;
        this.key = key;
        this.owner = resolveOneOrMoreStr(owner);
        this.ttl = ttl;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
    }

    getSerdeTransformerName(): string {
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
                        return [
                            null,
                            new KeyAlreadyAcquiredLockError(
                                `Key "${this.key.resolved}" already acquired`,
                            ),
                        ];
                    }

                    return [await resolveLazyable(asyncFn), null];
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
        settings?: AquireBlockingSettings,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, KeyAlreadyAcquiredLockError>> => {
                try {
                    const hasAquired = await this.acquireBlocking(settings);
                    if (!hasAquired) {
                        return [
                            null,
                            new KeyAlreadyAcquiredLockError(
                                `Key "${this.key.resolved}" already acquired`,
                            ),
                        ];
                    }

                    return [await resolveLazyable(asyncFn), null];
                } finally {
                    await this.release();
                }
            },
        );
    }

    runBlockingOrFail<TValue = void>(
        asyncFn: AsyncLazy<TValue>,
        settings?: AquireBlockingSettings,
    ): LazyPromise<TValue> {
        return new LazyPromise(async () => {
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
            const prevState = this.lockState.get()?.getTime() ?? null;
            try {
                this.lockState.remove();
                const hasAquired = await this.adapter.acquire(
                    this.key.namespaced,
                    this.owner,
                    this.ttl,
                );
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
                    const event: NotAvailableLockEvent = {
                        key: this.key.resolved,
                        owner: this.owner,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.NOT_AVAILABLE, event)
                        .defer();
                }
                return hasAquired;
            } catch (error: unknown) {
                this.lockState.set(prevState);
                const event: UnexpectedErrorLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();

                throw new UnableToAquireLockError(
                    `A Lock with name of "${this.key.resolved}" could not be acquired.`,
                    error,
                );
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
        settings: AquireBlockingSettings = {},
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
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
        settings?: AquireBlockingSettings,
    ): LazyPromise<void> {
        return new LazyPromise(async () => {
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
            const prevState = this.lockState.get()?.getTime() ?? null;
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
                this.lockState.set(prevState);
                const event: UnexpectedErrorLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw new UnableToReleaseLockError(
                    `A Lock with name of "${this.key.resolved}" could not be released.`,
                    error,
                );
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

    forceRelease(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const prevState = this.lockState.get()?.getTime() ?? null;
            try {
                await this.adapter.forceRelease(this.key.namespaced);
                this.lockState.remove();
                const event: ForceReleasedLockEvent = {
                    key: this.key.resolved,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.FORCE_RELEASED, event)
                    .defer();
            } catch (error: unknown) {
                this.lockState.set(prevState);
                const event: UnexpectedErrorLockEvent = {
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                };
                this.eventDispatcher
                    .dispatch(LOCK_EVENTS.UNEXPECTED_ERROR, event)
                    .defer();
                throw new UnableToReleaseLockError(
                    `A Lock with name of "${this.key.resolved}" could not be released.`,
                    error,
                );
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

    refresh(ttl: TimeSpan = this.defaultRefreshTime): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const prevState = this.lockState.get()?.getTime() ?? null;
            try {
                const hasRefreshed = await this.adapter.refresh(
                    this.key.namespaced,
                    this.owner,
                    ttl,
                );
                if (hasRefreshed) {
                    const event: RefreshedLockEvent = {
                        key: this.key.resolved,
                        owner: this.owner,
                        ttl,
                    };
                    this.lockState.set(ttl);
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.REFRESHED, event)
                        .defer();
                } else {
                    const event: UnownedRefreshTryLockEvent = {
                        key: this.key.resolved,
                        owner: this.owner,
                    };
                    this.eventDispatcher
                        .dispatch(LOCK_EVENTS.UNOWNED_REFRESH_TRY, event)
                        .defer();
                }
                return hasRefreshed;
            } catch (error: unknown) {
                this.lockState.set(prevState);
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

    refreshOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            const hasRefreshed = await this.refresh(ttl);
            if (!hasRefreshed) {
                throw new UnownedRefreshLockError(
                    `Unonwed refresh on key "${this.key.resolved}" by owner "${this.owner}"`,
                );
            }
        });
    }

    getRemainingTime(): LazyPromise<TimeSpan | null> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            return this.lockState.getRemainingTime();
        });
    }

    getOwner(): LazyPromise<string> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLazyPromise(async () => {
            return this.owner;
        });
    }
}
