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
import { KeyNotFoundCacheError } from "@/cache/contracts/_module-exports.js";
import { resolveAsyncLazyable, validate } from "@/utilities/_module-exports.js";
import type { AsyncLazyable } from "@/utilities/_module-exports.js";
import { type NoneFunc } from "@/utilities/_module-exports.js";
import { Task } from "@/task/_module-exports.js";
import type {
    IEventBus,
    Unsubscribe,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IEventListenable,
    EventListener,
} from "@/event-bus/contracts/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { isDatabaseCacheAdapter } from "@/cache/implementations/derivables/cache/is-database-cache-adapter.js";
import { DatabaseCacheAdapter } from "@/cache/implementations/derivables/cache/database-cache-adapter.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";
import { Namespace } from "@/namespace/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export type CacheSettingsBase<TType = unknown> = {
    /**
     * You can provide any [standard schema](https://standardschema.dev/) compliant object to validate all input and output data to ensure runtime type safety.
     */
    schema?: StandardSchemaV1<TType>;

    /**
     * You can enable validating cache values when retrieving them.
     * @default true
     */
    shouldValidateOutput?: boolean;

    /**
     * @default
     * ```ts
     * import { Namespace } from "@daiso-tech/core/namespace";
     *
     * new Namespace("@cache")
     * ```
     */
    namespace?: Namespace;

    /**
     * @default
     * ```ts
     * import { EventBus } from "@daiso-tech/core/event-bus";
     * import { NoOpEventBusAdapter } from "@daiso-tech/core/event-bus/no-op-event-bus-adapter";
     *
     * new EventBus({
     *   adapter: new NoOpEventBusAdapter()
     * })
     * ```
     */
    eventBus?: IEventBus;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     * @default null
     */
    defaultTtl?: ITimeSpan | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export type CacheAdapterVariants<TType> =
    | ICacheAdapter<TType>
    | IDatabaseCacheAdapter<TType>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export type CacheSettings<TType = unknown> = CacheSettingsBase<TType> & {
    adapter: CacheAdapterVariants<any>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export const DEFAULT_CACHE_NAMESPACE = new Namespace("@cache");

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export class Cache<TType = unknown> implements ICache<TType> {
    private readonly eventBus: IEventBus<CacheEventMap<TType>>;
    private readonly adapter: ICacheAdapter<TType>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly namespace: Namespace;
    private readonly schema: StandardSchemaV1<TType> | undefined;
    private readonly shouldValidateOutput: boolean;

    /**
     *
     * @example
     * ```ts
     * import { KyselyCacheAdapter } from "@daiso-tech/core/cache/kysely-cache-adapter";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter"
     * import Sqlite from "better-sqlite3";
     * import { Cache } from "@daiso-tech/core/cache";
     * import { Kysely, SqliteDialect } from "kysely";
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheAdapter = new KyselyCacheAdapter({
     *   kysely: new Kysely({
     *     dialect: new SqliteDialect({
     *       database,
     *     }),
     *   }),
     *   serde,
     * });
     * // You need initialize the adapter once before using it.
     * await cacheAdapter.init();
     *
     * const cache = new Cache({
     *   adapter: cacheAdapter,
     * });
     * ```
     */
    constructor(settings: CacheSettings<TType>) {
        const {
            shouldValidateOutput = true,
            schema,
            namespace = DEFAULT_CACHE_NAMESPACE,
            adapter,
            eventBus = new EventBus<any>({
                adapter: new NoOpEventBusAdapter(),
            }),
            defaultTtl = null,
        } = settings;

        this.shouldValidateOutput = shouldValidateOutput;
        this.schema = schema;
        this.namespace = namespace;
        this.defaultTtl =
            defaultTtl === null ? null : TimeSpan.fromTimeSpan(defaultTtl);
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
    ): Task<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    removeListener<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): Task<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    listenOnce<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): Task<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    asPromise<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
    ): Task<CacheEventMap<TType>[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribeOnce<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): Task<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    /**
     * You can listen to the following {@link CacheEventMap | `CacheEventMap`} of the {@link ICache | `ICache`} instance.
     * To understand how this method works, refer to {@link IEventListenable | `IEventListenable `}.
     */
    subscribe<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): Task<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    exists(key: string): Task<boolean> {
        return new Task(async () => {
            const value = await this.get(key);
            return value !== null;
        });
    }

    missing(key: string): Task<boolean> {
        return new Task(async () => {
            const hasKey = await this.exists(key);
            return !hasKey;
        });
    }

    get(key: string): Task<TType | null> {
        return new Task(async () => {
            const keyObj = this.namespace.create(key);
            try {
                const value = await this.adapter.get(keyObj.toString());
                if (this.shouldValidateOutput && value !== null) {
                    await validate(this.schema, value);
                }

                if (value === null) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.get(),
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.FOUND, {
                            key: keyObj.get(),
                            value,
                        })
                        .detach();
                }

                return value;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.get()],
                        method: this.get.name,
                        error,
                    })
                    .detach();
                throw error;
            }
        });
    }

    getOrFail(key: string): Task<TType> {
        return new Task<TType>(async () => {
            const value = await this.get(key);
            if (value === null) {
                throw new KeyNotFoundCacheError(
                    `Key "${this.namespace.create(key).get()}" is not found`,
                );
            }
            return value;
        });
    }

    getAndRemove(key: string): Task<TType | null> {
        return new Task(async () => {
            const keyObj = this.namespace.create(key);
            try {
                const value = await this.adapter.getAndRemove(
                    keyObj.toString(),
                );
                if (this.shouldValidateOutput && value !== null) {
                    await validate(this.schema, value);
                }

                if (value === null) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.get(),
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.FOUND, {
                            key: keyObj.get(),
                            value,
                        })
                        .detach();
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "removed",
                            key: keyObj.get(),
                        })
                        .detach();
                }
                return value;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.get()],
                        method: this.get.name,
                        error,
                    })
                    .detach();
                throw error;
            }
        });
    }

    getOr(
        key: string,
        defaultValue: AsyncLazyable<NoneFunc<TType>>,
    ): Task<TType> {
        return new Task<TType>(async () => {
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
        key: string,
        valueToAdd: AsyncLazyable<NoneFunc<TType>>,
        ttl?: ITimeSpan | null,
    ): Task<TType> {
        return new Task<TType>(async () => {
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
        key: string,
        value: TType,
        ttl: ITimeSpan | null = this.defaultTtl,
    ): Task<boolean> {
        return new Task(async () => {
            const ttlAsTimeSpan =
                ttl === null ? null : TimeSpan.fromTimeSpan(ttl);
            const keyObj = this.namespace.create(key);
            try {
                await validate(this.schema, value);
                const hasAdded = await this.adapter.add(
                    keyObj.toString(),
                    value,
                    ttlAsTimeSpan,
                );
                if (hasAdded) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "added",
                            key: keyObj.get(),
                            value,
                            ttl: ttlAsTimeSpan,
                        })
                        .detach();
                }
                return hasAdded;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.get()],
                        value,
                        method: this.add.name,
                        error,
                    })
                    .detach();
                throw error;
            }
        });
    }

    put(
        key: string,
        value: TType,
        ttl: ITimeSpan | null = this.defaultTtl,
    ): Task<boolean> {
        return new Task(async () => {
            const ttlAsTimeSpan =
                ttl === null ? null : TimeSpan.fromTimeSpan(ttl);
            const keyObj = this.namespace.create(key);
            try {
                await validate(this.schema, value);
                const hasUpdated = await this.adapter.put(
                    keyObj.toString(),
                    value,
                    ttlAsTimeSpan,
                );
                if (hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "updated",
                            key: keyObj.get(),
                            value,
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "added",
                            key: keyObj.get(),
                            value,
                            ttl: ttlAsTimeSpan,
                        })
                        .detach();
                }
                return hasUpdated;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.get()],
                        value,
                        method: this.put.name,
                        error,
                    })
                    .detach();
                throw error;
            }
        });
    }

    update(key: string, value: TType): Task<boolean> {
        return new Task(async () => {
            const keyObj = this.namespace.create(key);
            try {
                await validate(this.schema, value);
                const hasUpdated = await this.adapter.update(
                    keyObj.toString(),
                    value,
                );
                if (hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "updated",
                            key: keyObj.get(),
                            value,
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.get(),
                        })
                        .detach();
                }
                return hasUpdated;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.get()],
                        value,
                        method: this.update.name,
                        error,
                    })
                    .detach();
                throw error;
            }
        });
    }

    increment(key: string, value = 0 as Extract<TType, number>): Task<boolean> {
        return new Task(async () => {
            const keyObj = this.namespace.create(key);
            try {
                const hasUpdated = await this.adapter.increment(
                    keyObj.toString(),
                    value,
                );
                if (hasUpdated && value > 0) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "incremented",
                            key: keyObj.get(),
                            value,
                        })
                        .detach();
                }
                if (hasUpdated && value < 0) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "decremented",
                            key: keyObj.get(),
                            value: -value,
                        })
                        .detach();
                }
                if (!hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.get(),
                        })
                        .detach();
                }
                return hasUpdated;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.get()],
                        value,
                        method: this.increment.name,
                        error,
                    })
                    .detach();
                throw new TypeError(
                    `Unable to increment or decrement none number type key "${keyObj.get()}"`,
                    { cause: error },
                );
            }
        });
    }

    decrement(key: string, value = 0 as Extract<TType, number>): Task<boolean> {
        return new Task(async () => {
            return await this.increment(key, -value as Extract<TType, number>);
        });
    }

    remove(key: string): Task<boolean> {
        return new Task(async () => {
            const keyObj = this.namespace.create(key);
            try {
                const hasRemoved = await this.adapter.removeMany([
                    keyObj.toString(),
                ]);
                if (hasRemoved) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: "removed",
                            key: keyObj.get(),
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj.get(),
                        })
                        .detach();
                }
                return hasRemoved;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: [keyObj.get()],
                        method: this.remove.name,
                        error,
                    })
                    .detach();
                throw error;
            }
        });
    }

    removeMany(keys: Iterable<string>): Task<boolean> {
        return new Task(async () => {
            const keysArr = [...keys];
            if (keysArr.length === 0) {
                return true;
            }
            const keyObjArr = keysArr.map((key) => this.namespace.create(key));
            try {
                const hasRemovedAtLeastOne = await this.adapter.removeMany(
                    keyObjArr.map((keyObj) => keyObj.toString()),
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
                                    key: keyObj.get(),
                                },
                            ] as const,
                    );
                    for (const [eventName, event] of events) {
                        this.eventBus.dispatch(eventName, event).detach();
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
                                    key: keyObj.get(),
                                },
                            ] as const,
                    );
                    for (const [eventName, event] of events) {
                        this.eventBus.dispatch(eventName, event).detach();
                    }
                }
                return hasRemovedAtLeastOne;
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        keys: keyObjArr.map((keyObj) => keyObj.get()),
                        method: this.remove.name,
                        error,
                    })
                    .detach();
                throw error;
            }
        });
    }

    clear(): Task<void> {
        return new Task(async () => {
            try {
                const promise = this.eventBus.dispatch(
                    CACHE_EVENTS.CLEARED,
                    {},
                );
                await this.adapter.removeByKeyPrefix(this.namespace.toString());
                promise.detach();
            } catch (error: unknown) {
                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        method: this.clear.name,
                        error,
                    })
                    .detach();
                throw error;
            }
        });
    }
}
