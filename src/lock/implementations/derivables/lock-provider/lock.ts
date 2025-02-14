/**
 * @module Lock
 */

import type { LazyPromiseable, Result } from "@/utilities/_module";
import type { TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import { LazyPromise } from "@/async/_module";
import type { ILockAdapter, LockEvents } from "@/lock/contracts/_module";
import {
    UnexpectedErrorLockEvent,
    KeyAcquiredLockEvent,
    KeyAlreadyAcquiredLockError,
    KeyAlreadyAcquiredLockEvent,
    KeyForceReleasedLockEvent,
    KeyReleasedLockEvent,
    KeyRefreshedLockEvent,
    UnableToAquireLockError,
    UnownedRefreshLockError,
    UnownedRefreshLockEvent,
    UnownedReleaseLockError,
    UnownedReleaseLockEvent,
    type ILock,
} from "@/lock/contracts/_module";
import type {
    EventClass,
    Listener,
    EventInstance,
    Unsubscribe,
    IGroupableEventBus,
    IEventBus,
    IEventDispatcher,
} from "@/event-bus/contracts/_module";
import {
    type ILockStateRecord,
    LockState,
} from "@/lock/implementations/derivables/lock-provider/lock-state";

/**
 * @internal
 */
export type ISerializedLock = {
    group: string;
    key: string;
    owner: string;
    ttlInMs: number | null;
    expirationInMs: number | null;
};

/**
 * @internal
 */
export type LockSettings = {
    lockEventBus: IGroupableEventBus<LockEvents>;
    lockProviderEventDispatcher: IEventDispatcher<LockEvents>;
    adapter: ILockAdapter;
    key: string;
    owner: string;
    defaultRefreshTime: TimeSpan;
    ttl: TimeSpan | null;
    expirationInMs: number | null;
    lazyPromiseSettings: {
        retryAttempts: number | null;
        backoffPolicy: BackoffPolicy | null;
        retryPolicy: RetryPolicy | null;
        timeout: TimeSpan | null;
    };
    stateRecord: ILockStateRecord;
};

/**
 * @internal
 */
export class Lock implements ILock {
    static serialize(deserializedValue: Lock): ISerializedLock {
        return {
            group: deserializedValue.adapter.getGroup(),
            key: deserializedValue.key,
            owner: deserializedValue.owner,
            ttlInMs: deserializedValue.ttl?.toMilliseconds() ?? null,
            expirationInMs: deserializedValue.state.get()?.getTime() ?? null,
        };
    }

    private readonly lockProviderEventDispatcher: IEventDispatcher<LockEvents>;
    private readonly lockEventBus: IEventBus<LockEvents>;
    private readonly adapter: ILockAdapter;
    private readonly key: string;
    private readonly owner: string;
    private readonly ttl: TimeSpan | null;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly lazyPromiseSettings: LockSettings["lazyPromiseSettings"];
    private readonly state: LockState;
    private readonly expirationInMs: number | null;

    constructor(settings: LockSettings) {
        const {
            lockProviderEventDispatcher,
            lockEventBus,
            defaultRefreshTime,
            adapter,
            key,
            owner,
            ttl,
            lazyPromiseSettings,
            stateRecord,
            expirationInMs,
        } = settings;
        this.expirationInMs = expirationInMs;
        this.lockProviderEventDispatcher = lockProviderEventDispatcher;
        this.lockEventBus = lockEventBus.withGroup([adapter.getGroup(), key]);
        this.defaultRefreshTime = defaultRefreshTime;
        this.adapter = adapter;
        this.key = key;
        this.owner = owner;
        this.ttl = ttl;
        this.lazyPromiseSettings = lazyPromiseSettings;
        this.state = new LockState(stateRecord, key);
        this.state.set(expirationInMs);
    }

    private createLayPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn)
            .setRetryAttempts(this.lazyPromiseSettings.retryAttempts)
            .setBackoffPolicy(this.lazyPromiseSettings.backoffPolicy)
            .setRetryPolicy(this.lazyPromiseSettings.retryPolicy)
            .setTimeout(this.lazyPromiseSettings.timeout);
    }

    run<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>> {
        return this.createLayPromise(
            async (): Promise<Result<TValue, KeyAlreadyAcquiredLockError>> => {
                if (typeof asyncFn === "function") {
                    asyncFn = new LazyPromise(asyncFn);
                }
                try {
                    const hasAquired = await this.acquire();
                    if (!hasAquired) {
                        return [
                            null,
                            new KeyAlreadyAcquiredLockError(
                                `Key "${this.key}" already acquired`,
                            ),
                        ];
                    }

                    return [await asyncFn, null];
                } finally {
                    await this.release();
                }
            },
        ).setRetryPolicy((error) => error instanceof UnableToAquireLockError);
    }

    runOrFail<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
    ): LazyPromise<TValue> {
        return this.createLayPromise(async () => {
            try {
                if (typeof asyncFn === "function") {
                    asyncFn = new LazyPromise(asyncFn);
                }
                await this.acquireOrFail();
                return await asyncFn;
            } finally {
                await this.release();
            }
        }).setRetryPolicy(
            (error) =>
                error instanceof UnableToAquireLockError ||
                error instanceof KeyAlreadyAcquiredLockError,
        );
    }

    acquire(): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            try {
                this.state.remove();
                const hasAquired = await this.adapter.acquire(
                    this.key,
                    this.owner,
                    this.ttl,
                );
                if (hasAquired) {
                    this.state.set(this.ttl);
                    const event = new KeyAcquiredLockEvent({
                        key: this.key,
                        owner: this.owner,
                        ttl: this.ttl,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                } else {
                    const event = new KeyAlreadyAcquiredLockEvent({
                        key: this.key,
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                }
                return hasAquired;
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.lockEventBus.dispatch(event).defer();
                this.lockProviderEventDispatcher.dispatch(event).defer();
                throw error;
            }
        });
    }

    acquireOrFail(): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new KeyAlreadyAcquiredLockError(
                    `Key "${this.key}" already acquired`,
                );
            }
        });
    }

    release(): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            try {
                const hasReleased = await this.adapter.release(
                    this.key,
                    this.owner,
                );
                if (hasReleased) {
                    this.state.remove();
                    const event = new KeyReleasedLockEvent({
                        key: this.key,
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                } else {
                    const event = new UnownedReleaseLockEvent({
                        key: this.key,
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                }
                return hasReleased;
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.lockEventBus.dispatch(event).defer();
                this.lockProviderEventDispatcher.dispatch(event).defer();
                throw error;
            }
        });
    }

    releaseOrFail(): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const hasRelased = await this.release();
            if (!hasRelased) {
                throw new UnownedReleaseLockError(
                    `Unonwed release on key "${this.key}" by owner "${this.owner}"`,
                );
            }
        });
    }

    forceRelease(): LazyPromise<void> {
        return this.createLayPromise(async () => {
            try {
                await this.adapter.forceRelease(this.key);
                this.state.remove();
                const event = new KeyForceReleasedLockEvent({
                    key: this.key,
                });
                this.lockEventBus.dispatch(event).defer();
                this.lockProviderEventDispatcher.dispatch(event).defer();
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.lockEventBus.dispatch(event).defer();
                this.lockProviderEventDispatcher.dispatch(event).defer();
                throw error;
            }
        });
    }

    isExpired(): LazyPromise<boolean> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLayPromise(async () => {
            try {
                return this.state.isExpired();
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.lockEventBus.dispatch(event).defer();
                this.lockProviderEventDispatcher.dispatch(event).defer();
                throw error;
            }
        });
    }

    isLocked(): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const isExpired = await this.isExpired();
            return !isExpired;
        });
    }

    refresh(ttl: TimeSpan = this.defaultRefreshTime): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            try {
                const hasRefreshed = await this.adapter.refresh(
                    this.key,
                    this.owner,
                    ttl,
                );
                if (hasRefreshed) {
                    const event = new KeyRefreshedLockEvent({
                        key: this.key,
                        owner: this.owner,
                        ttl,
                    });
                    this.state.set(ttl);
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                } else {
                    const event = new UnownedRefreshLockEvent({
                        key: this.key,
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                }
                return hasRefreshed;
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key,
                    owner: this.owner,
                    ttl: this.ttl,
                    error,
                });
                this.lockEventBus.dispatch(event).defer();
                this.lockProviderEventDispatcher.dispatch(event).defer();
                throw error;
            }
        });
    }

    refreshOrFail(ttl?: TimeSpan): LazyPromise<void> {
        return this.createLayPromise(async () => {
            const hasRefreshed = await this.refresh(ttl);
            if (!hasRefreshed) {
                throw new UnownedRefreshLockError(
                    `Unonwed refresh on key "${this.key}" by owner "${this.owner}"`,
                );
            }
        });
    }

    getRemainingTime(): LazyPromise<TimeSpan | null> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLayPromise(async () => {
            return this.state.getRemainingTime();
        });
    }

    getOwner(): LazyPromise<string> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return this.createLayPromise(async () => {
            return this.owner;
        });
    }

    addListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.addListener(event, listener);
    }

    addListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.addListenerMany(events, listener);
    }

    removeListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.removeListener(event, listener);
    }

    removeListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.removeListenerMany(events, listener);
    }

    listenOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.listenOnce(event, listener);
    }

    subscribe<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockEventBus.subscribe(event, listener);
    }

    subscribeMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockEventBus.subscribeMany(events, listener);
    }
}
