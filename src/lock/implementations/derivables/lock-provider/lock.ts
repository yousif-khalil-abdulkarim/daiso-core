/**
 * @module Lock
 */

import type { LazyPromiseable, Result } from "@/utilities/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";
import { delay, LazyPromise } from "@/async/_module-exports.js";
import type {
    AquireBlockingSettings,
    ILockAdapter,
    LockEvents,
} from "@/lock/contracts/_module-exports.js";
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
} from "@/lock/contracts/_module-exports.js";
import type {
    EventClass,
    EventListener,
    EventInstance,
    Unsubscribe,
    IGroupableEventBus,
    IEventBus,
    IEventDispatcher,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
} from "@/event-bus/contracts/_module-exports.js";
import {
    type ILockStateRecord,
    LockState,
} from "@/lock/implementations/derivables/lock-provider/lock-state.js";

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
    defaultBlockingInterval: TimeSpan;
    defaultBlockingTime: TimeSpan;
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
 * IMPORTANT: This class is not intended to be instantiated directly, instead it should be created by the <i>LockProvider</i> class instance.
 * @group Derivables
 */
export class Lock implements ILock {
    /**
     * @internal
     */
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
    private readonly defaultBlockingInterval: TimeSpan;
    private readonly defaultBlockingTime: TimeSpan;
    private readonly defaultRefreshTime: TimeSpan;
    private readonly lazyPromiseSettings: LockSettings["lazyPromiseSettings"];
    private readonly state: LockState;

    /**
     * @internal
     */
    constructor(settings: LockSettings) {
        const {
            lockProviderEventDispatcher,
            lockEventBus,
            defaultBlockingInterval,
            defaultBlockingTime,
            defaultRefreshTime,
            adapter,
            key,
            owner,
            ttl,
            lazyPromiseSettings,
            stateRecord,
            expirationInMs,
        } = settings;
        this.lockProviderEventDispatcher = lockProviderEventDispatcher;
        this.lockEventBus = lockEventBus.withGroup([adapter.getGroup(), key]);
        this.defaultBlockingInterval = defaultBlockingInterval;
        this.defaultBlockingTime = defaultBlockingTime;
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

    /**
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { delay } from "@daiso-tech/core/async";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * async function fn(): Promise<void> {
     *   await lock.run(async () => {
     *     console.log("START: ", 1);
     *     // Let’s pretend we’re doing async database work.
     *     await delay(TimeSpan.fromSeconds(2));
     *     console.log("END: ", 2);
     *   });
     * }
     *
     * await Promise.allSettled([
     *   fn(),
     *   fn(),
     *   fn(),
     *   fn(),
     * ]);
     * ```
     *
     * You can also pass an <i>{@link LazyPromise}</i> instead of async function.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { delay } from "@daiso-tech/core/async";
     * import { Cache } from "@daiso-tech/core/cache/implementations/derivables";
     * import { MemoryCacheAdapter } from "@daiso-tech/core/cache/implementations/adapters";
     * import type { IGroupableCache } from "@daiso-tech/core/cache/contracts";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const cache: IGroupableCache = new Cache({
     *   // Let's pretend when the cache adapter increments a key it will occur in 2 async, get the value, increment the value in memory and update the key.
     *   adapter: new MemoryCacheAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     * await cache.put("a", 0);
     *
     * const lock = lockProvider.create("a");
     *
     * async function fn(): Promise<void> {
     *   // The lock will ensure the key will be incremented correctly
     *   await lock.run(cache.increment("a", 1));
     * }
     *
     * await Promise.allSettled([
     *   fn(),
     *   fn(),
     *   fn(),
     *   fn(),
     * ]);
     * ```
     */
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

    /**
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { delay } from "@daiso-tech/core/async";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * async function fn(): Promise<void> {
     *   await lock.runOrFail(async () => {
     *     console.log("START: ", 1);
     *     // Let’s pretend we’re doing async database work.
     *     await delay(TimeSpan.fromSeconds(2));
     *     console.log("END: ", 2);
     *   })
     *   // Retries 4 times to acquire the lock, then throws an error.
     *   .setRetryAttempts(4);
     * }
     *
     * await Promise.allSettled([
     *   fn(),
     *   fn(),
     *   fn(),
     *   fn(),
     * ]);
     * ```
     *
     * You can also pass an <i>{@link LazyPromise}</i> instead of async function.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { delay } from "@daiso-tech/core/async";
     * import { Cache } from "@daiso-tech/core/cache/implementations/derivables";
     * import { MemoryCacheAdapter } from "@daiso-tech/core/cache/implementations/adapters";
     * import type { IGroupableCache } from "@daiso-tech/core/cache/contracts";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const cache: IGroupableCache = new Cache({
     *   // Let's pretend when the cache adapter increments a key it will occur in 2 async, get the value, increment the value in memory and update the key.
     *   adapter: new MemoryCacheAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     * await cache.put("a", 0);
     *
     * const lock = lockProvider.create("a");
     *
     * async function fn(): Promise<void> {
     *   await lock
     *     // The lock will ensure the key will be incremented correctly
     *     .runOrFail(cache.increment("a", 1));
     *     // Retries 4 times to acquire the lock, then throws an error.
     *     .setRetryAttempts(4);
     * }
     *
     * await Promise.allSettled([
     *   fn(),
     *   fn(),
     *   fn(),
     *   fn(),
     * ]);
     * ```
     */
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

    /**
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { delay } from "@daiso-tech/core/async";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * async function fn(): Promise<void> {
     *   await lock.runBlocking(async () => {
     *     console.log("START: ", 1);
     *     // Let’s pretend we’re doing async database work.
     *     await delay(TimeSpan.fromSeconds(2));
     *     console.log("END: ", 2);
     *   });
     * }
     *
     * await Promise.allSettled([
     *   fn(),
     *   fn(),
     *   fn(),
     *   fn(),
     * ]);
     * ```
     *
     * You can also pass an <i>{@link LazyPromise}</i> instead of async function.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { delay } from "@daiso-tech/core/async";
     * import { Cache } from "@daiso-tech/core/cache/implementations/derivables";
     * import { MemoryCacheAdapter } from "@daiso-tech/core/cache/implementations/adapters";
     * import type { IGroupableCache } from "@daiso-tech/core/cache/contracts";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const cache: IGroupableCache = new Cache({
     *   // Let's pretend when the cache adapter increments a key it will occur in 2 async, get the value, increment the value in memory and update the key.
     *   adapter: new MemoryCacheAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     * await cache.put("a", 0);
     *
     * const lock = lockProvider.create("a");
     *
     * async function fn(): Promise<void> {
     *   // The lock will ensure the key will be incremented correctly
     *   await lock.runBlocking(cache.increment("a", 1));
     * }
     *
     * await Promise.allSettled([
     *   fn(),
     *   fn(),
     *   fn(),
     *   fn(),
     * ]);
     * ```
     */
    runBlocking<TValue = void>(
        asyncFn: LazyPromiseable<TValue>,
        settings?: AquireBlockingSettings,
    ): LazyPromise<Result<TValue, KeyAlreadyAcquiredLockError>> {
        return this.createLayPromise(
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

    /**
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { delay } from "@daiso-tech/core/async";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * async function fn(): Promise<void> {
     *   // Use try-finally when acquiring a lock to ensure it’s released if an error happens.
     *   try {
     *     const hasAquired = await lock.acquire();
     *     if (!hasAquired) {
     *       return;
     *     }
     *     console.log("START: ", 1);
     *     // Let’s pretend we’re doing async database work.
     *     await delay(TimeSpan.fromSeconds(2));
     *     console.log("END: ", 2);
     *   }
     *   finally {
     *     await lock.release();
     *   }
     * }
     *
     * await Promise.allSettled([
     *   fn(),
     *   fn(),
     *   fn(),
     *   fn(),
     * ]);
     * ```
     */
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

    /**
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { delay } from "@daiso-tech/core/async";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * async function fn(): Promise<void> {
     *   // Use try-finally when acquiring a lock to ensure it’s released if an error happens.
     *   try {
     *     // Retries 4 times to acquire the lock, then throws an error.
     *     await lock.acquireOrFail().setRetryAttempts(4);
     *     console.log("START: ", 1);
     *     // Let’s pretend we’re doing async database work.
     *     await delay(TimeSpan.fromSeconds(2));
     *     console.log("END: ", 2);
     *   }
     *   finally {
     *     await lock.release();
     *   }
     * }
     *
     * await Promise.allSettled([
     *   fn(),
     *   fn(),
     *   fn(),
     *   fn(),
     * ]);
     * ```
     */
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

    /**
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import { TimeSpan } from "@daiso-tech/core/utilities";
     * import { delay } from "@daiso-tech/core/async";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * async function fn(): Promise<void> {
     *   // Use try-finally when acquiring a lock to ensure it’s released if an error happens.
     *   try {
     *     const hasAquired = await lock.acquireBlocking();
     *     if (!hasAquired) {
     *       return;
     *     }
     *     console.log("START: ", 1);
     *     // Let’s pretend we’re doing async database work.
     *     await delay(TimeSpan.fromSeconds(2));
     *     console.log("END: ", 2);
     *   }
     *   finally {
     *     await lock.release();
     *   }
     * }
     *
     * await Promise.allSettled([
     *   fn(),
     *   fn(),
     *   fn(),
     *   fn(),
     * ]);
     * ```
     */
    acquireBlocking(
        settings: AquireBlockingSettings = {},
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const {
                time = this.defaultBlockingInterval,
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

    /**
     * You can listen to different events of the current <i>Lock</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lock.addListener(KeyAcquiredLockEvent, listener);
     * await lock.acquire();
     * ```
     */
    addListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.addListener(event, listener);
    }

    /**
     * You can listen to different events of the current <i>Lock</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lock.addListenerMany([KeyAcquiredLockEvent], listener);
     * await lock.acquire();
     * ```
     */
    addListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.addListenerMany(events, listener);
    }

    /**
     * You can listen to different events of the current <i>Lock</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lock.addListener(KeyAcquiredLockEvent, listener);
     * await lock.removeListener(KeyAcquiredLockEvent, listener);
     * await lock.acquire();
     * ```
     */
    removeListener<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.removeListener(event, listener);
    }

    /**
     * You can listen to different events of the current <i>Lock</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lock.addListenerMany([KeyAcquiredLockEvent], listener);
     * await lock.removeListenerMany([KeyAcquiredLockEvent], listener);
     * await lock.acquire();
     * ```
     */
    removeListenerMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.removeListenerMany(events, listener);
    }

    /**
     * You can listen to different events of the current <i>Lock</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * await lock.listenOnce(KeyAcquiredLockEvent, listener);
     * await lock.acquire();
     * ```
     */
    listenOnce<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.lockEventBus.listenOnce(event, listener);
    }

    asPromise<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>> {
        return this.lockEventBus.asPromise(event);
    }

    /**
     * You can listen to different events of the current <i>Lock</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * const unsubscribe = await lock.subscribe(KeyAcquiredLockEvent, listener);
     * await lock.acquire();
     * await unsubscribe();
     * ```
     */
    subscribe<TEventClass extends EventClass<LockEvents>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockEventBus.subscribe(event, listener);
    }

    /**
     * You can listen to different events of the current <i>Lock</i> class instance.
     *
     * Refer to <i>{@link LockEvents}</i>, to se all events dispatched by <i>LockProvider</i> class instance.
     * Refer to <i>{@link IEventListenable}</i> for details on how the method works.
     * @example
     * ```ts
     * import { type IGroupableLockProvider, type LockEvents, KeyAcquiredLockEvent } from "@daiso-tech/core/lock/contracts";
     * import { LockProvider } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import type { EventListener} from "@daiso-tech/core/event-bus/contracts";
     * import { EventBus } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new Serde(SuperJsonSerdeAdapter);
     * const lockProvider: IGroupableLockProvider = new LockProvider({
     *   serde,
     *   adapter: new MemoryLockAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     *
     * const lock = lockProvider.create("a");
     *
     * const listener: EventListener<LockEvents> = event => {
     *   console.log(event);
     * }
     * const unsubscribe = await lock.subscribeMany([KeyAcquiredLockEvent], listener);
     * await lock.acquire();
     * await unsubscribe();
     * ```
     */
    subscribeMany<TEventClass extends EventClass<LockEvents>>(
        events: TEventClass[],
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.lockEventBus.subscribeMany(events, listener);
    }
}
