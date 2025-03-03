/**
 * @module Lock
 */

import type {
    IKey,
    Invokable,
    LazyPromiseable,
    OneOrMore,
    Result,
    TimeSpan,
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
    UnexpectedErrorLockEvent,
    UnownedRefreshLockError,
    UnownedRefreshLockEvent,
    UnownedReleaseLockError,
    UnownedReleaseLockEvent,
    type AquireBlockingSettings,
    type LockEvents,
} from "@/new-lock/contracts/_module-exports.js";
import {
    type ILock,
    type ILockAdapter,
} from "@/new-lock/contracts/_module-exports.js";
import { delay, LazyPromise } from "@/async/_module-exports.js";
import type {
    EventClass,
    EventInstance,
    IEventBus,
    IEventDispatcher,
    Unsubscribe,
} from "@/event-bus/contracts/_module-exports.js";

import type { LockState } from "@/new-lock/implementations/derivables/lock-provider/lock-state.js";

/**
 * @internal
 */
export type ISerializedLock = {
    group: string | null;
    key: string;
    owner: string;
    ttlInMs: number | null;
    expirationInMs: number | null;
};

/**
 * @internal
 */
export type LockSettings = {
    group: string | null;
    createLazyPromise: <TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ) => LazyPromise<TValue>;
    adapterPromise: Promise<ILockAdapter>;
    lockState: LockState;
    lockEventBus: IEventBus<LockEvents>;
    lockProviderEventDispatcher: IEventDispatcher<LockEvents>;
    key: IKey;
    owner: OneOrMore<string>;
    ttl: TimeSpan | null;
    expirationInMs: number | null;
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
    defaultRefreshTime: TimeSpan;
};

/**
 * IMPORTANT: This class is not intended to be instantiated directly, instead it should be created by the <i>LockProvider</i> class instance.
 * @group Derivables
 */
export class Lock implements ILock {
    /**
     * @internal
     */
    static serialize(deserializedValue: Lock): ISerializedLock {
        return {
            group: deserializedValue.group,
            key: deserializedValue.key.resolved(),
            owner: deserializedValue.owner,
            ttlInMs: deserializedValue.ttl?.toMilliseconds() ?? null,
            expirationInMs:
                deserializedValue.lockState.get()?.getTime() ?? null,
        };
    }

    private readonly createLazyPromise: <TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ) => LazyPromise<TValue>;
    private readonly adapterPromise: Promise<ILockAdapter>;
    private readonly lockState: LockState;
    private readonly lockEventBus: IEventBus<LockEvents>;
    private readonly lockProviderEventDispatcher: IEventDispatcher<LockEvents>;
    private readonly key: IKey;
    private readonly owner: string;
    private readonly ttl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly group: string | null;

    /**
     * @internal
     */
    constructor(settings: LockSettings) {
        const {
            group,
            createLazyPromise,
            adapterPromise,
            lockState,
            lockEventBus,
            lockProviderEventDispatcher,
            key,
            owner,
            ttl,
            expirationInMs,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
        } = settings;

        this.group = group;
        this.createLazyPromise = createLazyPromise;
        this.adapterPromise = adapterPromise;
        this.lockState = lockState;
        this.lockState.set(expirationInMs);
        this.lockEventBus = lockEventBus;
        this.lockProviderEventDispatcher = lockProviderEventDispatcher;
        this.key = key;
        this.owner = resolveOneOrMoreStr(owner);
        this.ttl = ttl;
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
        this.defaultRefreshTime = defaultRefreshTime;
    }

    addListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.addListener(event, listener);
    }

    addListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.addListenerMany(events, listener);
    }

    removeListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.removeListener(event, listener);
    }

    removeListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.removeListenerMany(events, listener);
    }

    listenOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.listenOnce(event, listener);
    }

    asPromise<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>> {
        return this.lockEventBus.asPromise(event);
    }

    subscribe<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockEventBus.subscribe(event, listener);
    }

    subscribeMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockEventBus.subscribeMany(events, listener);
    }

    run<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>> {
        return this.createLazyPromise(
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
                                `Key "${this.key.resolved()}" already acquired`,
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
        return this.createLazyPromise(async () => {
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

    runBlocking<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
        settings?: AquireBlockingSettings,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>> {
        return this.createLazyPromise(
            async (): Promise<Result<TValue, KeyAlreadyAcquiredLockError>> => {
                if (typeof asyncFn === "function") {
                    asyncFn = new LazyPromise(asyncFn);
                }
                try {
                    const hasAquired = await this.acquireBlocking(settings);
                    if (!hasAquired) {
                        return [
                            null,
                            new KeyAlreadyAcquiredLockError(
                                `Key "${this.key.resolved()}" already acquired`,
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

    acquire(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            try {
                const adapter = await this.adapterPromise;
                this.lockState.remove();
                const hasAquired = await adapter.acquire(
                    this.key.prefixed(),
                    this.owner,
                    this.ttl,
                );
                if (hasAquired) {
                    this.lockState.set(this.ttl);
                    const event = new KeyAcquiredLockEvent({
                        key: this.key.resolved(),
                        owner: this.owner,
                        ttl: this.ttl,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                } else {
                    const event = new KeyAlreadyAcquiredLockEvent({
                        key: this.key.resolved(),
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                }
                return hasAquired;
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved(),
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
        return this.createLazyPromise(async () => {
            const hasAquired = await this.acquire();
            if (!hasAquired) {
                throw new KeyAlreadyAcquiredLockError(
                    `Key "${this.key.resolved()}" already acquired`,
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
                await delay(interval);
            }
            return false;
        });
    }

    release(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            try {
                const adapter = await this.adapterPromise;
                const hasReleased = await adapter.release(
                    this.key.prefixed(),
                    this.owner,
                );
                if (hasReleased) {
                    this.lockState.remove();
                    const event = new KeyReleasedLockEvent({
                        key: this.key.resolved(),
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                } else {
                    const event = new UnownedReleaseLockEvent({
                        key: this.key.resolved(),
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                }
                return hasReleased;
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved(),
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
        return this.createLazyPromise(async () => {
            const hasRelased = await this.release();
            if (!hasRelased) {
                throw new UnownedReleaseLockError(
                    `Unonwed release on key "${this.key.resolved()}" by owner "${this.owner}"`,
                );
            }
        });
    }

    forceRelease(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            try {
                const adapter = await this.adapterPromise;
                await adapter.forceRelease(this.key.prefixed());
                this.lockState.remove();
                const event = new KeyForceReleasedLockEvent({
                    key: this.key.resolved(),
                });
                this.lockEventBus.dispatch(event).defer();
                this.lockProviderEventDispatcher.dispatch(event).defer();
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved(),
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
        return this.createLazyPromise(async () => {
            try {
                return this.lockState.isExpired();
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved(),
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
        return this.createLazyPromise(async () => {
            const isExpired = await this.isExpired();
            return !isExpired;
        });
    }

    refresh(ttl: TimeSpan = this.defaultRefreshTime): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            try {
                const adapter = await this.adapterPromise;
                const hasRefreshed = await adapter.refresh(
                    this.key.prefixed(),
                    this.owner,
                    ttl,
                );
                if (hasRefreshed) {
                    const event = new KeyRefreshedLockEvent({
                        key: this.key.resolved(),
                        owner: this.owner,
                        ttl,
                    });
                    this.lockState.set(ttl);
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                } else {
                    const event = new UnownedRefreshLockEvent({
                        key: this.key.resolved(),
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                }
                return hasRefreshed;
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved(),
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
        return this.createLazyPromise(async () => {
            const hasRefreshed = await this.refresh(ttl);
            if (!hasRefreshed) {
                throw new UnownedRefreshLockError(
                    `Unonwed refresh on key "${this.key.resolved()}" by owner "${this.owner}"`,
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
