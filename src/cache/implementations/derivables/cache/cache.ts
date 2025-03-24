/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * @module Cache
 */

import type {
    CacheEvents,
    IDatabaseCacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import {
    KeyFoundCacheEvent,
    KeyNotFoundCacheEvent,
    KeyAddedCacheEvent,
    KeyUpdatedCacheEvent,
    KeyRemovedCacheEvent,
    KeyIncrementedCacheEvent,
    KeyDecrementedCacheEvent,
    KeysClearedCacheEvent,
    UnexpectedErrorCacheEvent,
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
import type { RetryPolicy } from "@/async/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type {
    IGroupableEventBus,
    IEventBus,
    Unsubscribe,
    EventClass,
    EventInstance,
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
    IKeyPrefixer,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export type CacheSettingsBase = {
    keyPrefixer: IKeyPrefixer;

    /**
     * You can pass a <i>{@link Factory}</i> of <i>{@link LazyPromise}</i> to configure default settings for all <i>{@link LazyPromise}</i> instances used in the <i>Cache</i> class.
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
    eventBus?: IGroupableEventBus<any>;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     * @default {null}
     */
    defaultTtl?: TimeSpan | null;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export type CacheAdapter<TType> =
    | ICacheAdapter<TType>
    | IDatabaseCacheAdapter<TType>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export type CacheSettings = CacheSettingsBase & {
    adapter: CacheAdapter<any>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export class Cache<TType = unknown> implements ICache<TType> {
    private static defaultRetryPolicy: RetryPolicy = (error: unknown) => {
        return !(
            error instanceof TypeCacheError ||
            error instanceof KeyNotFoundCacheError
        );
    };

    private readonly groupdEventBus: IGroupableEventBus<CacheEvents<TType>>;
    private readonly eventBus: IEventBus<CacheEvents<TType>>;
    private readonly adapterFactoryable: CacheAdapter<TType>;
    private readonly adapter: ICacheAdapter<TType>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly keyPrefixer: IKeyPrefixer;
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
            eventBus: groupdEventBus = new EventBus({
                keyPrefixer: new KeyPrefixer("event-bus"),
                adapter: new MemoryEventBusAdapter(),
            }),
            defaultTtl = null,
            lazyPromiseFactory = (invokable) => new LazyPromise(invokable),
        } = settings;

        this.keyPrefixer = keyPrefixer;
        this.groupdEventBus = groupdEventBus;
        this.adapterFactoryable = adapter;
        this.defaultTtl = defaultTtl;
        this.lazyPromiseFactory = resolveFactory(lazyPromiseFactory);

        this.eventBus = this.groupdEventBus.withGroup(
            this.keyPrefixer.resolvedRootPrefix,
        );
        if (this.keyPrefixer.resolvedGroup) {
            this.eventBus = this.groupdEventBus.withGroup([
                this.keyPrefixer.resolvedRootPrefix,
                this.keyPrefixer.resolvedGroup,
            ]);
        }

        if (isDatabaseCacheAdapter(adapter)) {
            this.adapter = new DatabaseCacheAdapter(adapter);
        } else {
            this.adapter = adapter;
        }
    }

    /**
     * You can listen to the following <i>{@link CacheEvents}</i> of the <i>{@link ICache}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    addListener<TEventClass extends EventClass<CacheEvents<TType>>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(event, listener);
    }

    /**
     * You can listen to the following <i>{@link CacheEvents}</i> of the <i>{@link ICache}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    removeListener<TEventClass extends EventClass<CacheEvents<TType>>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(event, listener);
    }

    /**
     * You can listen to the following <i>{@link CacheEvents}</i> of the <i>{@link ICache}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    listenOnce<TEventClass extends EventClass<CacheEvents<TType>>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.listenOnce(event, listener);
    }

    /**
     * You can listen to the following <i>{@link CacheEvents}</i> of the <i>{@link ICache}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    asPromise<TEventClass extends EventClass<CacheEvents<TType>>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>> {
        return this.eventBus.asPromise(event);
    }

    /**
     * You can listen to the following <i>{@link CacheEvents}</i> of the <i>{@link ICache}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    subscribeOnce<TEventClass extends EventClass<CacheEvents<TType>>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeOnce(event, listener);
    }

    /**
     * You can listen to the following <i>{@link CacheEvents}</i> of the <i>{@link ICache}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    subscribe<TEventClass extends EventClass<CacheEvents<TType>>>(
        event: TEventClass,
        listener: EventListener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(event, listener);
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return this.lazyPromiseFactory(asyncFn).setRetryPolicy(
            Cache.defaultRetryPolicy,
        );
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
                        .dispatch(
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                        )
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(
                            new KeyFoundCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                                value,
                            }),
                        )
                        .defer();
                }
                return value;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedErrorCacheEvent({
                            group: this.getGroup(),
                            keys: [keyObj.resolved],
                            method: this.get.name,
                            error,
                        }),
                    )
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
                        .dispatch(
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                        )
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(
                            new KeyFoundCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                                value,
                            }),
                        )
                        .defer();
                    this.eventBus
                        .dispatch(
                            new KeyRemovedCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                        )
                        .defer();
                }
                return value;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedErrorCacheEvent({
                            group: this.getGroup(),
                            keys: [keyObj.resolved],
                            method: this.get.name,
                            error,
                        }),
                    )
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
                        .dispatch(
                            new KeyAddedCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                                value,
                                ttl,
                            }),
                        )
                        .defer();
                }
                return hasAdded;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedErrorCacheEvent({
                            group: this.getGroup(),
                            keys: [keyObj.resolved],
                            value,
                            method: this.add.name,
                            error,
                        }),
                    )
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
                        .dispatch(
                            new KeyUpdatedCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                                value,
                            }),
                        )
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(
                            new KeyAddedCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                                value,
                                ttl,
                            }),
                        )
                        .defer();
                }
                return hasUpdated;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedErrorCacheEvent({
                            group: this.getGroup(),
                            keys: [keyObj.resolved],
                            value,
                            method: this.put.name,
                            error,
                        }),
                    )
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
                        .dispatch(
                            new KeyUpdatedCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                                value,
                            }),
                        )
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                        )
                        .defer();
                }
                return hasUpdated;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedErrorCacheEvent({
                            group: this.getGroup(),
                            keys: [keyObj.resolved],
                            value,
                            method: this.update.name,
                            error,
                        }),
                    )
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
                        .dispatch(
                            new KeyIncrementedCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                                value,
                            }),
                        )
                        .defer();
                }
                if (hasUpdated && value < 0) {
                    this.eventBus
                        .dispatch(
                            new KeyDecrementedCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                                value: -value,
                            }),
                        )
                        .defer();
                }
                if (!hasUpdated) {
                    this.eventBus
                        .dispatch(
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                        )
                        .defer();
                }
                return hasUpdated;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedErrorCacheEvent({
                            group: this.getGroup(),
                            keys: [keyObj.resolved],
                            value,
                            method: this.increment.name,
                            error,
                        }),
                    )
                    .defer();
                throw error;
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
                        .dispatch(
                            new KeyRemovedCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                        )
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                        )
                        .defer();
                }
                return hasRemoved;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedErrorCacheEvent({
                            group: this.getGroup(),
                            keys: [keyObj.resolved],
                            method: this.remove.name,
                            error,
                        }),
                    )
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
                        (keyObj) =>
                            new KeyRemovedCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                    );
                    for (const event of events) {
                        this.eventBus.dispatch(event).defer();
                    }
                } else {
                    const events = keyObjArr.map(
                        (keyObj) =>
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                    );
                    for (const event of events) {
                        this.eventBus.dispatch(event).defer();
                    }
                }
                return hasRemovedAtLeastOne;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedErrorCacheEvent({
                            group: this.getGroup(),
                            keys: keyObjArr.map((keyObj) => keyObj.resolved),
                            method: this.remove.name,
                            error,
                        }),
                    )
                    .defer();
                throw error;
            }
        });
    }

    clear(): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            try {
                const promise = this.eventBus.dispatch(
                    new KeysClearedCacheEvent({
                        group: this.getGroup(),
                    }),
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
                    .dispatch(
                        new UnexpectedErrorCacheEvent({
                            group: this.getGroup(),
                            method: this.clear.name,
                            error,
                        }),
                    )
                    .defer();
                throw error;
            }
        });
    }

    /**
     * @example
     * ```ts
     * import { Cache } from "@daiso-tech/core/cache";
     * import { MemoryCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import { KeyPrefixer } from "@daiso-tech/core/utilities";
     *
     * const cache = new Cache({
     *   adapter: new MemoryCacheAdapter(),
     *   keyPrefixer: new KeyPrefixer("cache")
     * });
     *
     * // Will log null because the cache is not in a group
     * console.log(cache.getGroup());
     *
     * const groupedCache = cache.withGroup("group-a");
     *
     * // Will log "group-a" because the groupedCache is in a group
     * console.log(groupedCache.getGroup());
     * ```
     */
    getGroup(): string | null {
        if (this.keyPrefixer.resolvedGroup) {
            return this.keyPrefixer.resolvedGroup;
        }
        return null;
    }

    /**
     * @example
     * ```ts
     * import { Cache } from "@daiso-tech/core/cache";
     * import { MemoryCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import { KeyPrefixer } from "@daiso-tech/core/utilities";
     *
     * const cache = new Cache({
     *   adapter: new MemoryCacheAdapter(),
     *   keyPrefixer: new KeyPrefixer("cache")
     * });
     *
     * const groupedCache = cache.withGroup("group-a");
     * await groupedCache.add("a", 1);
     *
     * // Will log "a".
     * console.log(await groupedCache.get("a"));
     *
     * // Will log null because the caches are in different groups.
     * console.log(await cache.get("a"));
     * ```
     */
    withGroup(group: OneOrMore<string>): ICache<TType> {
        const cache = new Cache<TType>({
            keyPrefixer: this.keyPrefixer.withGroup(group),
            adapter: this.adapterFactoryable,
            eventBus: this.groupdEventBus,
            defaultTtl: this.defaultTtl,
            lazyPromiseFactory: this.lazyPromiseFactory,
        });
        return cache;
    }
}
