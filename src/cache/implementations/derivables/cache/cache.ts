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
    UnexpectedCacheErrorEvent,
    type ICache,
    type ICacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import {
    KeyNotFoundCacheError,
    TypeCacheError,
} from "@/cache/contracts/_module-exports.js";
import { type IGroupableCache } from "@/cache/contracts/_module-exports.js";
import {
    isAsyncFactory,
    resolveAsyncFactoryable,
    resolveAsyncLazyable,
} from "@/utilities/_module-exports.js";
import {
    type AsyncLazyable,
    type OneOrMore,
} from "@/utilities/_module-exports.js";
import {
    type NoneFunc,
    type TimeSpan,
    KeyPrefixer,
    type AsyncFactoryable,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type IFactoryObject,
} from "@/utilities/_module-exports.js";
import type {
    BackoffPolicy,
    LazyPromiseSettingsBase,
    RetryPolicy,
} from "@/async/_module-exports.js";
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
import type { IKeyPrefixer, Items } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export type CacheSettingsBase = LazyPromiseSettingsBase & {
    keyPrefixer: IKeyPrefixer;

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
export type CacheAdapterFactoryable<TType> = AsyncFactoryable<
    string,
    ICacheAdapter<TType> | IDatabaseCacheAdapter<TType>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export type CacheSettings = CacheSettingsBase & {
    adapter: CacheAdapterFactoryable<any>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export class Cache<TType = unknown> implements IGroupableCache<TType> {
    private static resolveCacheAdapter<TType>(
        adapter: ICacheAdapter<TType> | IDatabaseCacheAdapter<TType>,
    ): ICacheAdapter<TType> {
        if (isDatabaseCacheAdapter<TType>(adapter)) {
            return new DatabaseCacheAdapter(adapter);
        }
        return adapter;
    }

    private static async resolveCacheAdapterFactoryable<TType>(
        factoryable: CacheAdapterFactoryable<TType>,
        rootPrefix: string,
    ): Promise<ICacheAdapter<TType>> {
        const adapter = await resolveAsyncFactoryable(factoryable, rootPrefix);
        return Cache.resolveCacheAdapter(adapter);
    }

    private static defaultRetryPolicy: RetryPolicy = (error: unknown) => {
        return !(
            error instanceof TypeCacheError ||
            error instanceof KeyNotFoundCacheError
        );
    };

    private readonly groupdEventBus: IGroupableEventBus<CacheEvents<TType>>;
    private readonly eventBus: IEventBus<CacheEvents<TType>>;
    private readonly adapterFactoryable: CacheAdapterFactoryable<TType>;
    private readonly adapterPromise: PromiseLike<ICacheAdapter<TType>>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly retryAttempts: number | null;
    private readonly backoffPolicy: BackoffPolicy | null;
    private readonly retryPolicy: RetryPolicy | null;
    private readonly retryTimeout: TimeSpan | null;
    private readonly totalTimeout: TimeSpan | null;
    private readonly keyPrefixer: IKeyPrefixer;

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
     *
     * You can pass factory function that will create an adapter for every group.
     * @example
     * ```ts
     * import { SqliteCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import type { IDatabaseCacheAdapter } from "@daiso-tech/core/cache/contracts";
     * import { Serde } from "@daiso-tech/core/serde";
     * import type { ISerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters"
     * import Sqlite from "better-sqlite3";
     * import { Cache } from "@daiso-tech/core/cache";
     * import { KeyPrefixer, type ISqliteDatabase, type AsyncFactoryFn } from "@daiso-tech/core/utilities";
     *
     * function cahceAdapterFactory(database: ISqliteDatabase, serde: ISerde<string>): AsyncFactoryFn<string, IDatabaseCacheAdapter> {
     *   return async (prefix) => {
     *     const cacheAdapter = new SqliteCacheAdapter({
     *       database,
     *       serde,
     *       tableName: `cache_${prefix}`
     *     });
     *     await cacheAdapter.init();
     *     return cacheAdapter;
     *   }
     * }
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cache = new Cache({
     *   keyPrefixer: new KeyPrefixer("cache"),
     *   adapter: cahceAdapterFactory(database, serde),
     * });
     * ```
     *
     * You can also pass factory object that implements <i>{@link IFactoryObject}</i> contract. This useful for depedency injection libraries.
     * @example
     * ```ts
     * import { SqliteCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import type { IDatabaseCacheAdapter } from "@daiso-tech/core/cache/contracts";
     * import { Serde } from "@daiso-tech/core/serde";
     * import type { ISerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters"
     * import Sqlite from "better-sqlite3";
     * import { Cache } from "@daiso-tech/core/cache";
     * import { KeyPrefixer, type ISqliteDatabase, type IAsyncFactoryObject } from "@daiso-tech/core/utilities";
     *
     * class CahceAdapterFactory implements IAsyncFactoryObject<string, IDatabaseCacheAdapter> {
     *   constructor(private readonly database: ISqliteDatabase, private readonly serde: ISerde<string>) {}
     *
     *   async use(prefix: string): Promise<IDatabaseCacheAdapter> {
     *     const cacheAdapter = new SqliteCacheAdapter({
     *       database: this.database,
     *       serde: this.serde,
     *       tableName: `cache_${prefix}`
     *     });
     *     await cacheAdapter.init();
     *     return cacheAdapter;
     *   }
     * }
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cache = new Cache({
     *   keyPrefixer: new KeyPrefixer("cache"),
     *   adapter: new CahceAdapterFactory(database, serde),
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
            retryAttempts = null,
            backoffPolicy = null,
            retryPolicy = Cache.defaultRetryPolicy,
            retryTimeout = null,
            totalTimeout = null,
        } = settings;

        this.keyPrefixer = keyPrefixer;
        this.groupdEventBus = groupdEventBus;
        this.adapterFactoryable = adapter;
        this.defaultTtl = defaultTtl;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.retryTimeout = retryTimeout;
        this.totalTimeout = totalTimeout;

        this.eventBus = this.groupdEventBus.withGroup(
            this.keyPrefixer.resolvedRootPrefix,
        );
        if (this.keyPrefixer.resolvedGroup) {
            this.eventBus = this.groupdEventBus.withGroup([
                this.keyPrefixer.resolvedRootPrefix,
                this.keyPrefixer.resolvedGroup,
            ]);
        }

        this.adapterPromise = new LazyPromise(() =>
            Cache.resolveCacheAdapterFactoryable(
                this.adapterFactoryable,
                this.keyPrefixer.keyPrefix,
            ),
        );
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
    addListenerMany<TEventClassArr extends EventClass<CacheEvents<TType>>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<void> {
        return this.eventBus.addListenerMany(events, listener);
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
    removeListenerMany<TEventClassArr extends EventClass<CacheEvents<TType>>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListenerMany(events, listener);
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

    /**
     * You can listen to the following <i>{@link CacheEvents}</i> of the <i>{@link ICache}</i> instance.
     * To understand how this method works, refer to <i>{@link IEventListenable}</i>.
     */
    subscribeMany<TEventClassArr extends EventClass<CacheEvents<TType>>[]>(
        events: [...TEventClassArr],
        listener: EventListener<EventInstance<Items<TEventClassArr>>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeMany(events, listener);
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn, {
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            retryTimeout: this.retryTimeout,
            totalTimeout: this.totalTimeout,
        });
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
                const adapter = await this.adapterPromise;
                const value = await adapter.get(keyObj.prefixed);
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
                        new UnexpectedCacheErrorEvent({
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
                const adapter = await this.adapterPromise;
                const value = await adapter.getAndRemove(keyObj.prefixed);
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
                        new UnexpectedCacheErrorEvent({
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
                const adapter = await this.adapterPromise;
                const hasAdded = await adapter.add(keyObj.prefixed, value, ttl);
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
                        new UnexpectedCacheErrorEvent({
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
                const adapter = await this.adapterPromise;
                const hasUpdated = await adapter.put(
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
                        new UnexpectedCacheErrorEvent({
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
                const adapter = await this.adapterPromise;
                const hasUpdated = await adapter.update(keyObj.prefixed, value);
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
                        new UnexpectedCacheErrorEvent({
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
                const adapter = await this.adapterPromise;
                const hasUpdated = await adapter.increment(
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
                        new UnexpectedCacheErrorEvent({
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
                const adapter = await this.adapterPromise;
                const hasRemoved = await adapter.removeMany([keyObj.prefixed]);
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
                        new UnexpectedCacheErrorEvent({
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
                const adapter = await this.adapterPromise;
                const hasRemovedAtLeastOne = await adapter.removeMany(
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
                    this.eventBus.dispatchMany(events).defer();
                } else {
                    const events = keyObjArr.map(
                        (keyObj) =>
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key: keyObj.resolved,
                            }),
                    );
                    this.eventBus.dispatchMany(events).defer();
                }
                return hasRemovedAtLeastOne;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedCacheErrorEvent({
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
                const adapter = await this.adapterPromise;

                const promise = this.eventBus.dispatch(
                    new KeysClearedCacheEvent({
                        group: this.getGroup(),
                    }),
                );
                if (isAsyncFactory(this.adapterFactoryable)) {
                    await adapter.removeAll();
                    promise.defer();
                    return;
                }
                await adapter.removeByKeyPrefix(this.keyPrefixer.keyPrefix);
                promise.defer();
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(
                        new UnexpectedCacheErrorEvent({
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
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            retryTimeout: this.retryTimeout,
        });
        return cache;
    }
}
