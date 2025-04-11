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
import {
    KeyAcquiredLockEvent,
    KeyAlreadyAcquiredLockError,
    KeyAlreadyAcquiredLockEvent,
    KeyForceReleasedLockEvent,
    KeyRefreshedLockEvent,
    KeyReleasedLockEvent,
    UnableToAquireLockError,
    UnableToReleaseLockError,
    UnexpectedErrorLockEvent,
    UnownedRefreshLockError,
    UnownedRefreshLockEvent,
    UnownedReleaseLockError,
    UnownedReleaseLockEvent,
    type AquireBlockingSettings,
    type LockEvents,
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
    adapter: ILockAdapter;
    lockState: LockState;
    eventDispatcher: IEventDispatcher<LockEvents>;
    key: Key;
    owner: OneOrMore<string>;
    ttl: TimeSpan | null;
    expirationInMs: number | null;
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
    defaultRefreshTime: TimeSpan;
};

/**
 * IMPORTANT: This class is not intended to be instantiated directly, instead it should be created by the `LockProvider` class instance.
 * @group Derivables
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
    private readonly eventDispatcher: IEventDispatcher<LockEvents>;
    private readonly key: Key;
    private readonly owner: string;
    private readonly ttl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;

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
            expirationInMs,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
        } = settings;
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
                    this.key.prefixed,
                    this.owner,
                    this.ttl,
                );
                if (hasAquired) {
                    this.lockState.set(this.ttl);
                    const event = new KeyAcquiredLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                        ttl: this.ttl,
                    });
                    this.eventDispatcher.dispatch(event).defer();
                    this.eventDispatcher.dispatch(event).defer();
                } else {
                    const event = new KeyAlreadyAcquiredLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                    });
                    this.eventDispatcher.dispatch(event).defer();
                    this.eventDispatcher.dispatch(event).defer();
                }
                return hasAquired;
            } catch (error: unknown) {
                this.lockState.set(prevState);
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.eventDispatcher.dispatch(event).defer();
                this.eventDispatcher.dispatch(event).defer();
                // `A listener with name of "${resolvedListener.name}" could not added for "${String(event)}" event`,
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
                    this.key.prefixed,
                    this.owner,
                );
                if (hasReleased) {
                    this.lockState.remove();
                    const event = new KeyReleasedLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                    });
                    this.eventDispatcher.dispatch(event).defer();
                    this.eventDispatcher.dispatch(event).defer();
                } else {
                    const event = new UnownedReleaseLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                    });
                    this.eventDispatcher.dispatch(event).defer();
                    this.eventDispatcher.dispatch(event).defer();
                }
                return hasReleased;
            } catch (error: unknown) {
                this.lockState.set(prevState);
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.eventDispatcher.dispatch(event).defer();
                this.eventDispatcher.dispatch(event).defer();
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
                await this.adapter.forceRelease(this.key.prefixed);
                this.lockState.remove();
                const event = new KeyForceReleasedLockEvent({
                    key: this.key.resolved,
                });
                this.eventDispatcher.dispatch(event).defer();
                this.eventDispatcher.dispatch(event).defer();
            } catch (error: unknown) {
                this.lockState.set(prevState);
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.eventDispatcher.dispatch(event).defer();
                this.eventDispatcher.dispatch(event).defer();
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
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.eventDispatcher.dispatch(event).defer();
                this.eventDispatcher.dispatch(event).defer();
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
                    this.key.prefixed,
                    this.owner,
                    ttl,
                );
                if (hasRefreshed) {
                    const event = new KeyRefreshedLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                        ttl,
                    });
                    this.lockState.set(ttl);
                    this.eventDispatcher.dispatch(event).defer();
                    this.eventDispatcher.dispatch(event).defer();
                } else {
                    const event = new UnownedRefreshLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                    });
                    this.eventDispatcher.dispatch(event).defer();
                    this.eventDispatcher.dispatch(event).defer();
                }
                return hasRefreshed;
            } catch (error: unknown) {
                this.lockState.set(prevState);
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.eventDispatcher.dispatch(event).defer();
                this.eventDispatcher.dispatch(event).defer();
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
