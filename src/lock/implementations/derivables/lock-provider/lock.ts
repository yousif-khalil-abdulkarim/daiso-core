/**
 * @module Lock
 */

import type { Items, TimeSpan } from "@/utilities/_module-exports.js";
import {
    type IKey,
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
import type {
    EventClass,
    EventInstance,
    IEventBus,
    IEventDispatcher,
    Unsubscribe,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
    EventListener,
} from "@/event-bus/contracts/_module-exports.js";

import type { LockState } from "@/lock/implementations/derivables/lock-provider/lock-state.js";

/**
 * @internal
 */
export type ISerializedLock = {
    group: OneOrMore<string> | null;
    key: OneOrMore<string>;
    owner: string;
    ttlInMs: number | null;
    expirationInMs: number | null;
};

/**
 * @internal
 */
export type LockSettings = {
    group: OneOrMore<string> | null;
    createLazyPromise: <TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ) => LazyPromise<TValue>;
    adapterPromise: PromiseLike<ILockAdapter>;
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
    private readonly adapterPromise: PromiseLike<ILockAdapter>;
    private readonly lockState: LockState;
    private readonly lockEventBus: IEventBus<LockEvents>;
    private readonly lockProviderEventDispatcher: IEventDispatcher<LockEvents>;
    private readonly key: IKey;
    private readonly owner: string;
    private readonly ttl: TimeSpan | null;
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly group: OneOrMore<string> | null;

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

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of the <i>{@link Lock}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    addListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.addListener(event, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of the <i>{@link Lock}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    addListenerMany<TEventClassArr extends EventClass<LockEvents>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<void> {
        return this.lockEventBus.addListenerMany(events, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of the <i>{@link Lock}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    removeListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.removeListener(event, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of the <i>{@link Lock}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    removeListenerMany<TEventClassArr extends EventClass<LockEvents>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<void> {
        return this.lockEventBus.removeListenerMany(events, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of lock instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    listenOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.listenOnce(event, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of lock instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    asPromise<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>> {
        return this.lockEventBus.asPromise(event);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of lock instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    subscribeOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockEventBus.subscribeOnce(event, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of lock instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    subscribe<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockEventBus.subscribe(event, listener);
    }

    /**
     * You can listen to the following <i>{@link LockEvents}</i> of lock instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    subscribeMany<TEventClassArr extends EventClass<LockEvents>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockEventBus.subscribeMany(events, listener);
    }

    /**
     * You can pass in a sync function or async function.
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer, TimeSpan, LazyPromise } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/adapter";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/adapter/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * await lock.run(async () => {
     *   console.log("START");
     *   await LazyPromise.delay(TimeSpan.fromSeconds(10));
     *   console.log("END");
     * });
     * ```
     *
     * You can also pass in a <i>{@link LazyPromise}</i>. This is useful because all other components in this library returns <i>{@link LazyPromise}</i>.
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer, TimeSpan, LazyPromise } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/adapter";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/adapter/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * await lock.run(
     *   new LazyPromise(async () => {
     *     console.log("START");
     *     await LazyPromise.delay(TimeSpan.fromSeconds(10));
     *     console.log("END");
     *   })
     * );
     * ```
     */
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
        ).setRetryPolicy((error) => error instanceof UnableToAquireLockError);
    }

    /**
     * You can pass in a sync function or async function.
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer, TimeSpan, LazyPromise } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/adapter";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/adapter/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * await lock.runOrFail(async () => {
     *   console.log("START");
     *   await LazyPromise.delay(TimeSpan.fromSeconds(10));
     *   console.log("END");
     * });
     * ```
     *
     * You can also pass in a <i>{@link LazyPromise}</i>. This is useful because all other components in this library returns <i>{@link LazyPromise}</i>.
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer, TimeSpan, LazyPromise } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/adapter";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/adapter/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * await lock.runOrFail(
     *   new LazyPromise(async () => {
     *     console.log("START");
     *     await LazyPromise.delay(TimeSpan.fromSeconds(10));
     *     console.log("END");
     *   })
     * );
     * ```
     */
    runOrFail<TValue = void>(asyncFn: AsyncLazy<TValue>): LazyPromise<TValue> {
        return this.createLazyPromise(async () => {
            try {
                await this.acquireOrFail();
                return await resolveLazyable(asyncFn);
            } finally {
                await this.release();
            }
        }).setRetryPolicy(
            (error) =>
                error instanceof UnableToAquireLockError ||
                error instanceof KeyAlreadyAcquiredLockError,
        );
    }

    /**
     * You can pass in a sync function or async function.
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer, TimeSpan, LazyPromise } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/adapter";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/adapter/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * await lock.runBlocking(async () => {
     *   console.log("START");
     *   await LazyPromise.delay(TimeSpan.fromSeconds(10));
     *   console.log("END");
     * });
     * ```
     *
     * You can also pass in a <i>{@link LazyPromise}</i>. This is useful because all other components in this library returns <i>{@link LazyPromise}</i>.
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer, TimeSpan, LazyPromise } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/adapter";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/adapter/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * await lock.runBlocking(
     *   new LazyPromise(async () => {
     *     console.log("START");
     *     await LazyPromise.delay(TimeSpan.fromSeconds(10));
     *     console.log("END");
     *   })
     * );
     * ```
     */
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
        ).setRetryPolicy((error) => error instanceof UnableToAquireLockError);
    }

    /**
     * You can pass in a sync function or async function.
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer, TimeSpan, LazyPromise } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/adapter";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/adapter/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * await lock.runBlockingOrFail(async () => {
     *   console.log("START");
     *   await LazyPromise.delay(TimeSpan.fromSeconds(10));
     *   console.log("END");
     * });
     * ```
     *
     * You can also pass in a <i>{@link LazyPromise}</i>. This is useful because all other components in this library returns <i>{@link LazyPromise}</i>.
     * @example
     * ```ts
     * import { LockProvider } from "@daiso-tech/core/lock";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { KeyPrefixer, TimeSpan, LazyPromise } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/adapter";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/adapter/adapters";
     *
     * const lockProvider = new LockProvider({
     *   adapter: new MemoryLockAdapter(),
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   serde: new Serde(new SuperJsonSerdeAdapter())
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * await lock.runBlockingOrFail(
     *   new LazyPromise(async () => {
     *     console.log("START");
     *     await LazyPromise.delay(TimeSpan.fromSeconds(10));
     *     console.log("END");
     *   })
     * );
     * ```
     */
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
        }).setRetryPolicy((error) => error instanceof UnableToAquireLockError);
    }

    acquire(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            try {
                const adapter = await this.adapterPromise;
                this.lockState.remove();
                const hasAquired = await adapter.acquire(
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
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                } else {
                    const event = new KeyAlreadyAcquiredLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                }
                return hasAquired;
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved,
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
            try {
                const adapter = await this.adapterPromise;
                const hasReleased = await adapter.release(
                    this.key.prefixed,
                    this.owner,
                );
                if (hasReleased) {
                    this.lockState.remove();
                    const event = new KeyReleasedLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                } else {
                    const event = new UnownedReleaseLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                }
                return hasReleased;
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved,
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
                    `Unonwed release on key "${this.key.resolved}" by owner "${this.owner}"`,
                );
            }
        });
    }

    forceRelease(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            try {
                const adapter = await this.adapterPromise;
                await adapter.forceRelease(this.key.prefixed);
                this.lockState.remove();
                const event = new KeyForceReleasedLockEvent({
                    key: this.key.resolved,
                });
                this.lockEventBus.dispatch(event).defer();
                this.lockProviderEventDispatcher.dispatch(event).defer();
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved,
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
                    key: this.key.resolved,
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
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                } else {
                    const event = new UnownedRefreshLockEvent({
                        key: this.key.resolved,
                        owner: this.owner,
                    });
                    this.lockEventBus.dispatch(event).defer();
                    this.lockProviderEventDispatcher.dispatch(event).defer();
                }
                return hasRefreshed;
            } catch (error: unknown) {
                const event = new UnexpectedErrorLockEvent({
                    key: this.key.resolved,
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
