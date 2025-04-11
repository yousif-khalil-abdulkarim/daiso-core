/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * @module Cache
 */

import type {
    CacheEventMap,
    IDatabaseCacheAdapter,
    NotFoundCacheEvent,
    RemovedCacheEvent,
} from "@/cache/contracts/_module-exports.js";
import {
    CACHE_EVENTS,
    type ICache,
    type ICacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import {
    KeyNotFoundCacheError,
    TypeCacheError,
} from "@/cache/contracts/_module-exports.js";
import {
    isAsyncFactory,
    resolveAsyncLazyable,
    resolveFactory,
} from "@/utilities/_module-exports.js";
import {
    type AsyncLazyable,
    type OneOrMore,
} from "@/utilities/_module-exports.js";
import {
    type NoneFunc,
    type TimeSpan,
    KeyPrefixer,
} from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type {
    IEventBus,
    Unsubscribe,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
    EventListener,
} from "@/event-bus/contracts/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { isDatabaseCacheAdapter } from "@/cache/implementations/derivables/cache/is-database-cache-adapter.js";
import { DatabaseCacheAdapter } from "@/cache/implementations/derivables/cache/database-cache-adapter.js";
import type {
    AsyncLazy,
    Factory,
    FactoryFn,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export type CacheSettingsBase = {
    keyPrefixer: KeyPrefixer;

    /**
     * You can pass a {@link Factory | `Factory`} of {@link LazyPromise| `LazyPromise`} to configure default settings for all {@link LazyPromise| `LazyPromise`} instances used in the `Cache` class.
     * @default
     * ```ts
     * import { LazyPromise } from "@daiso-tech/core/async";
     *
     * (invokable) => new LazyPromise(invokable)
     * ```
     */
    lazyPromiseFactory?: Factory<AsyncLazy<any>, LazyPromise<any>>;

    /**
     * @default
     * ```ts
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { KeyPrefixer } from "@daiso-tech/core/utilities";
     *
     * new EventBus({
     *   keyPrefixer: new KeyPrefixer("event-bus"),
     *   adapter: new MemoryEventBusAdapter()
     * })
     * ```
     */
    eventBus?: IEventBus;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     * @default {null}
     */
    defaultTtl?: TimeSpan | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export type CacheAdapter<TType> =
    | ICacheAdapter<TType>
    | IDatabaseCacheAdapter<TType>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export type CacheSettings = CacheSettingsBase & {
    adapter: CacheAdapter<any>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export class Cache<TType = unknown> implements ICache<TType> {
    private readonly eventBus: IEventBus<CacheEventMap<TType>>;
    private readonly adapterFactoryable: CacheAdapter<TType>;
    private readonly adapter: ICacheAdapter<TType>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly keyPrefixer: KeyPrefixer;
    private readonly lazyPromiseFactory: FactoryFn<
        AsyncLazy<any>,
        LazyPromise<any>
    >;

    /**
     *
     * @example
     * ```ts
     * import { SqliteCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters"
     * import Sqlite from "better-sqlite3";
     * import { Cache } from "@daiso-tech/core/cache";
     * import { KeyPrefixer } from "@daiso-tech/core/utilities";
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheAdapter = new SqliteCacheAdapter({
     *   database,
     *   serde,
     * });
     * // You need initialize the adapter once before using it.
     * await cacheAdapter.init();
     *
     * const cache = new Cache({
     *   keyPrefixer: new KeyPrefixer("cache"),
     *   adapter: cacheAdapter,
     * });
     * ```
     */
    constructor(settings: CacheSettings) {
        const {
            keyPrefixer,
            adapter,
            eventBus = new EventBus<any>({
                keyPrefixer: new KeyPrefixer("event-bus"),
                adapter: new MemoryEventBusAdapter(),
            }),
            defaultTtl = null,
            lazyPromiseFactory = (invokable) => new LazyPromise(invokable),
        } = settings;

        this.keyPrefixer = keyPrefixer;
        this.adapterFactoryable = adapter;
        this.defaultTtl = defaultTtl;
        this.lazyPromiseFactory = resolveFactory(lazyPromiseFactory);
        this.eventBus = eventBus;

        if (isDatabaseCacheAdapter(adapter)) {
            this.adapter = new DatabaseCacheAdapter(adapter);
        } else {
            this.adapter = adapter;
        }
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    addListener<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    removeListener<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    listenOnce<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): LazyPromise<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    asPromise<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
    ): LazyPromise<CacheEventMap<TType>[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribeOnce<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribe<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return this.lazyPromiseFactory(asyncFn);
    }

    exists(key: OneOrMore<string>): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const value = await this.get(key);
            return value !== null;
        });
    }

    missing(key: OneOrMore<string>): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const hasKey = await this.exists(key);
            return !hasKey;
        });
    }

    get(key: OneOrMore<string>): LazyPromise<TType | null> {
        return this.createLazyPromise(async () => {
            const keyObj = this.keyPrefixer.create(key);
            try {
                const value = await this.adapter.get(keyObj.prefixed);
                if (value === null) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.resolved,
                        })
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.FOUND, {
                            key: keyObj.resolved,
                            value,
                        })
                        .defer();
                }
                return value;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.resolved],
                        method: this.get.name,
                        error,
                    })
                    .defer();
                throw error;
            }
        });
    }

    getOrFail(key: OneOrMore<string>): LazyPromise<TType> {
        return this.createLazyPromise<TType>(async () => {
            const value = await this.get(key);
            if (value === null) {
                throw new KeyNotFoundCacheError(
                    `Key "${this.keyPrefixer.create(key).resolved}" is not found`,
                );
            }
            return value;
        });
    }

    getAndRemove(key: OneOrMore<string>): LazyPromise<TType | null> {
        return this.createLazyPromise(async () => {
            const keyObj = this.keyPrefixer.create(key);
            try {
                const value = await this.adapter.getAndRemove(keyObj.prefixed);
                if (value === null) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.resolved,
                        })
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.FOUND, {
                            key: keyObj.resolved,
                            value,
                        })
                        .defer();
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "removed",
                            key: keyObj.resolved,
                        })
                        .defer();
                }
                return value;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.resolved],
                        method: this.get.name,
                        error,
                    })
                    .defer();
                throw error;
            }
        });
    }

    getOr(
        key: OneOrMore<string>,
        defaultValue: AsyncLazyable<NoneFunc<TType>>,
    ): LazyPromise<TType> {
        return this.createLazyPromise<TType>(async () => {
            const value = await this.get(key);
            if (value === null) {
                const simplifiedValueToAdd =
                    await resolveAsyncLazyable(defaultValue);
                return simplifiedValueToAdd;
            }
            return value;
        });
    }

    getOrAdd(
        key: OneOrMore<string>,
        valueToAdd: AsyncLazyable<NoneFunc<TType>>,
        ttl?: TimeSpan | null,
    ): LazyPromise<TType> {
        return this.createLazyPromise<TType>(async () => {
            const value = await this.get(key);
            if (value === null) {
                const simplifiedValueToAdd =
                    await resolveAsyncLazyable<NoneFunc<TType>>(valueToAdd);
                await this.add(key, simplifiedValueToAdd, ttl);
                return simplifiedValueToAdd;
            }
            return value;
        });
    }

    add(
        key: OneOrMore<string>,
        value: TType,
        ttl: TimeSpan | null = this.defaultTtl,
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const keyObj = this.keyPrefixer.create(key);
            try {
                const hasAdded = await this.adapter.add(
                    keyObj.prefixed,
                    value,
                    ttl,
                );
                if (hasAdded) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "added",
                            key: keyObj.resolved,
                            value,
                            ttl,
                        })
                        .defer();
                }
                return hasAdded;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.resolved],
                        value,
                        method: this.add.name,
                        error,
                    })
                    .defer();
                throw error;
            }
        });
    }

    put(
        key: OneOrMore<string>,
        value: TType,
        ttl: TimeSpan | null = this.defaultTtl,
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const keyObj = this.keyPrefixer.create(key);
            try {
                const hasUpdated = await this.adapter.put(
                    keyObj.prefixed,
                    value,
                    ttl,
                );
                if (hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "updated",
                            key: keyObj.resolved,
                            value,
                        })
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "added",
                            key: keyObj.resolved,
                            value,
                            ttl,
                        })
                        .defer();
                }
                return hasUpdated;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.resolved],
                        value,
                        method: this.put.name,
                        error,
                    })
                    .defer();
                throw error;
            }
        });
    }

    update(key: OneOrMore<string>, value: TType): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const keyObj = this.keyPrefixer.create(key);
            try {
                const hasUpdated = await this.adapter.update(
                    keyObj.prefixed,
                    value,
                );
                if (hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "updated",
                            key: keyObj.resolved,
                            value,
                        })
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.resolved,
                        })
                        .defer();
                }
                return hasUpdated;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.resolved],
                        value,
                        method: this.update.name,
                        error,
                    })
                    .defer();
                throw error;
            }
        });
    }

    increment(
        key: OneOrMore<string>,
        value = 0 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const keyObj = this.keyPrefixer.create(key);
            try {
                const hasUpdated = await this.adapter.increment(
                    keyObj.prefixed,
                    value,
                );
                if (hasUpdated && value > 0) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "incremented",
                            key: keyObj.resolved,
                            value,
                        })
                        .defer();
                }
                if (hasUpdated && value < 0) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "decremented",
                            key: keyObj.resolved,
                            value: -value,
                        })
                        .defer();
                }
                if (!hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.resolved,
                        })
                        .defer();
                }
                return hasUpdated;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.resolved],
                        value,
                        method: this.increment.name,
                        error,
                    })
                    .defer();
                throw new TypeCacheError(
                    `Unable to increment or decrement none number type key "${keyObj.resolved}"`,
                    error,
                );
            }
        });
    }

    decrement(
        key: OneOrMore<string>,
        value = 0 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return await this.increment(key, -value as Extract<TType, number>);
        });
    }

    remove(key: OneOrMore<string>): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const keyObj = this.keyPrefixer.create(key);
            try {
                const hasRemoved = await this.adapter.removeMany([
                    keyObj.prefixed,
                ]);
                if (hasRemoved) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "removed",
                            key: keyObj.resolved,
                        })
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.resolved,
                        })
                        .defer();
                }
                return hasRemoved;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.resolved],
                        method: this.remove.name,
                        error,
                    })
                    .defer();
                throw error;
            }
        });
    }

    removeMany(keys: Iterable<OneOrMore<string>>): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            const keysArr = [...keys];
            if (keysArr.length === 0) {
                return true;
            }
            const keyObjArr = keysArr.map((key) =>
                this.keyPrefixer.create(key),
            );
            try {
                const hasRemovedAtLeastOne = await this.adapter.removeMany(
                    keyObjArr.map((keyObj) => keyObj.prefixed),
                );
                if (hasRemovedAtLeastOne) {
                    const events = keyObjArr.map(
                        (
                            keyObj,
                        ): [typeof CACHE_EVENTS.WRITTEN, RemovedCacheEvent] =>
                            [
                                CACHE_EVENTS.WRITTEN,
                                {
                                    type: "removed",
                                    key: keyObj.resolved,
                                },
                            ] as const,
                    );
                    for (const [eventName, event] of events) {
                        this.eventBus.dispatch(eventName, event).defer();
                    }
                } else {
                    const events = keyObjArr.map(
                        (
                            keyObj,
                        ): [
                            typeof CACHE_EVENTS.NOT_FOUND,
                            NotFoundCacheEvent,
                        ] =>
                            [
                                CACHE_EVENTS.NOT_FOUND,
                                {
                                    key: keyObj.resolved,
                                },
                            ] as const,
                    );
                    for (const [eventName, event] of events) {
                        this.eventBus.dispatch(eventName, event).defer();
                    }
                }
                return hasRemovedAtLeastOne;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: keyObjArr.map((keyObj) => keyObj.resolved),
                        method: this.remove.name,
                        error,
                    })
                    .defer();
                throw error;
            }
        });
    }

    clear(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            try {
                const promise = this.eventBus.dispatch(
                    CACHE_EVENTS.CLEARED,
                    {},
                );
                if (isAsyncFactory(this.adapterFactoryable)) {
                    await this.adapter.removeAll();
                    promise.defer();
                    return;
                }
                await this.adapter.removeByKeyPrefix(
                    this.keyPrefixer.keyPrefix,
                );
                promise.defer();
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        method: this.clear.name,
                        error,
                    })
                    .defer();
                throw error;
            }
        });
    }
}
