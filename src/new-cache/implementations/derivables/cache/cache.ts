/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * @module Cache
 */

import type {
    CacheEventMap,
    CacheWriteSettings,
    GetOrPutValue,
    GetOrPutSettings,
    GetOrPutDynamic,
} from "@/new-cache/contracts/_module.js";
import {
    CACHE_EVENTS,
    isCacheError,
    KeyExistsCacheError,
    StampedeCacheError,
    WRITTEN_CACHE_EVENT_TYPES,
    type ICache,
    type ICacheAdapter,
} from "@/new-cache/contracts/_module.js";
import { KeyNotFoundCacheError } from "@/new-cache/contracts/_module.js";
import {
    callInvokable,
    isInvokable,
    removeUndefinedProperties,
    resolveAsyncLazyable,
    validate,
    ValidationError,
} from "@/utilities/_module.js";
import type { AsyncLazyable } from "@/utilities/_module.js";
import { type NoneFunc } from "@/utilities/_module.js";
import type { ITask } from "@/task/contracts/_module.js";
import { Task } from "@/task/implementations/_module.js";
import type {
    IEventBus,
    Unsubscribe,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EventListener,
} from "@/event-bus/contracts/_module.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module.js";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { ITimeSpan } from "@/time-span/contracts/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";
import type { Key } from "@/namespace/_module.js";
import { Namespace } from "@/namespace/_module.js";
import type { CacheAdapterVariants } from "@/new-cache/contracts/types.js";
import { resolveCacheAdapter } from "@/new-cache/implementations/derivables/cache/resolve-cache-adapter.js";
import type { AsyncMiddlewareFn } from "@/hooks/_module.js";
import {
    FailedAcquireLockError,
    LOCK_STATE,
    type ILock,
    type ILockProvider,
    type LockProviderCreateSettings,
} from "@/lock/contracts/_module.js";
import { LockProvider } from "@/lock/implementations/derivables/_module.js";
import {
    MemoryLockAdapter,
    NoOpLockAdapter,
} from "@/lock/implementations/adapters/_module.js";
import {
    exponentialBackoff,
    type BackoffPolicy,
} from "@/backoff-policies/_module.js";
import { retry } from "@/resilience/_module.js";
import { resolveTtls } from "@/new-cache/implementations/derivables/cache/resolve-ttls.js";
import { resolveGetOrPutDynamic } from "@/new-cache/implementations/derivables/cache/resolve-get-or-put-dynamic-fn.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export type CacheSettingsBase<TType = unknown> = {
    lockProvider?: ILockProvider;

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
     * @default true
     */
    enableAsyncRefreshing?: boolean;

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

    /**
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/time-span"
     *
     * TimeSpan.fromMinutes(1)
     * ```
     */
    defaultStaleTtl?: ITimeSpan;

    /**
     * @default 0.2
     */
    defaultJitter?: number;

    /**
     * @default
     * ```ts
     * import { TimeSpan } from "@daiso-tech/core/task"
     *
     * TimeSpan.fromMinutes(1)
     * ```
     */
    defaultLockTtl?: ITimeSpan;

    /**
     * @default 4
     * ```
     */
    defaultLockMaxAttempts?: number;

    /**
     * @default
     * ```ts
     * import { exponentialBackoff } from "@daiso-tech/core/backoff-policies";
     *
     * exponentialBackof();
     * ```
     */
    defaultLockBackoffPolicy?: BackoffPolicy;

    /**
     * @internal
     * Should only be used for testing
     */
    _mathRandom?: () => number;
};

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
    private readonly defaultStaleTtl: TimeSpan;
    private readonly defaultJitter: number;
    private readonly defaultLockTtl: TimeSpan;
    private readonly defaultLockMaxAttempts: number;
    private readonly defaultLockBackoffPolicy: BackoffPolicy;
    private readonly enableAsyncRefreshing: boolean;
    private readonly namespace: Namespace;
    private readonly schema: StandardSchemaV1<TType> | undefined;
    private readonly shouldValidateOutput: boolean;
    private readonly _mathRandom: () => number;
    private readonly lockProvider: ILockProvider;
    private readonly noOpLockProvider: ILockProvider = new LockProvider({
        adapter: new NoOpLockAdapter(),
    });

    /**
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
            lockProvider = new LockProvider({
                adapter: new MemoryLockAdapter(),
            }),
            shouldValidateOutput = true,
            schema,
            namespace = DEFAULT_CACHE_NAMESPACE,
            adapter,
            eventBus = new EventBus<any>({
                adapter: new NoOpEventBusAdapter(),
            }),
            enableAsyncRefreshing = true,
            defaultTtl = null,
            defaultStaleTtl = TimeSpan.fromMinutes(1),
            defaultJitter = 0.2,
            defaultLockBackoffPolicy = exponentialBackoff(),
            defaultLockMaxAttempts = 4,
            defaultLockTtl = TimeSpan.fromMinutes(1),
            _mathRandom = () => Math.random(),
        } = settings;

        this.shouldValidateOutput = shouldValidateOutput;
        this.schema = schema;
        this.namespace = namespace;
        this.defaultTtl =
            defaultTtl === null ? null : TimeSpan.fromTimeSpan(defaultTtl);
        this.eventBus = eventBus;
        this.adapter = resolveCacheAdapter(adapter);
        this._mathRandom = _mathRandom;
        this.lockProvider = lockProvider;
        this.defaultStaleTtl = TimeSpan.fromTimeSpan(defaultStaleTtl);
        this.defaultLockBackoffPolicy = defaultLockBackoffPolicy;
        this.defaultLockMaxAttempts = defaultLockMaxAttempts;
        this.defaultLockTtl = TimeSpan.fromTimeSpan(defaultLockTtl);
        this.defaultJitter = defaultJitter;
        this.enableAsyncRefreshing = enableAsyncRefreshing;
    }

    addListener<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): ITask<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    removeListener<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): ITask<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    listenOnce<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): ITask<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    asPromise<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
    ): ITask<CacheEventMap<TType>[TEventName]> {
        return this.eventBus.asPromise(eventName);
    }

    subscribeOnce<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): ITask<Unsubscribe> {
        return this.eventBus.subscribeOnce(eventName, listener);
    }

    subscribe<TEventName extends keyof CacheEventMap<TType>>(
        eventName: TEventName,
        listener: EventListener<CacheEventMap<TType>[TEventName]>,
    ): ITask<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    exists(key: string): ITask<boolean> {
        return new Task(async () => {
            return !(await this.missing(key));
        });
    }

    missing(key: string): ITask<boolean> {
        return new Task(async () => {
            const value = await this.get(key);
            return value === null;
        });
    }

    private handleUnexpectedError = <TParameters extends unknown[], TReturn>(
        method: string,
        keys: Key[],
    ): AsyncMiddlewareFn<TParameters, TReturn> => {
        return async (args, next) => {
            try {
                return await next(...args);
            } catch (error: unknown) {
                if (isCacheError(error) || error instanceof ValidationError) {
                    throw error;
                }

                this.eventBus
                    .dispatch(CACHE_EVENTS.UNEXPECTED_ERROR, {
                        error,
                        method,
                        keys,
                    })
                    .detach();

                throw error;
            }
        };
    };

    get(key: string): ITask<TType | null> {
        const keyObj = this.namespace.create(key);
        return new Task(async () => {
            const cacheEntry = await this.adapter.get(keyObj.toString());
            if (cacheEntry === null) {
                return null;
            }
            const { value } = cacheEntry;
            return value;
        }).pipe([
            this.handleUnexpectedError(this.get.name, [keyObj]),
            async (args, next) => {
                const value = await next(...args);
                if (this.shouldValidateOutput && value !== null) {
                    await validate(this.schema, value);
                }
                return value;
            },
            async (args, next) => {
                const value = await next(...args);
                if (value === null) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj,
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.FOUND, {
                            key: keyObj,
                            value,
                        })
                        .detach();
                }
                return value;
            },
        ]);
    }

    getOrFail(key: string): ITask<TType> {
        return new Task<TType>(async () => {
            const value = await this.get(key);
            if (value === null) {
                throw KeyNotFoundCacheError.create(key);
            }
            return value;
        });
    }

    getAndRemove(key: string): ITask<TType | null> {
        const keyObj = this.namespace.create(key);
        return new Task(async () => {
            const value = await this.adapter.getAndRemove(keyObj.toString());
            return value;
        }).pipe([
            this.handleUnexpectedError(this.getAndRemove.name, [keyObj]),
            async (args, next) => {
                const value = await next(...args);
                if (this.shouldValidateOutput && value !== null) {
                    await validate(this.schema, value);
                }
                return value;
            },
            async (args, next) => {
                const value = await next(...args);

                if (value === null) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj,
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.FOUND, {
                            key: keyObj,
                            value,
                        })
                        .detach();
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: WRITTEN_CACHE_EVENT_TYPES.REMOVED,
                            key: keyObj,
                        })
                        .detach();
                }

                return value;
            },
        ]);
    }

    getAndRemoveOrFail(key: string): ITask<TType> {
        return new Task<TType>(async () => {
            const value = await this.getAndRemove(key);
            if (value === null) {
                throw KeyNotFoundCacheError.create(key);
            }
            return value;
        });
    }

    hasExpiration(key: string): ITask<boolean> {
        return new Task(async () => {
            const expiration = await this.getExpiration(key);
            return expiration !== null;
        });
    }

    getExpiration(key: string): ITask<TimeSpan | null> {
        const keyObj = this.namespace.create(key);
        return new Task(async () => {
            const cacheEntry = await this.adapter.get(keyObj.toString());
            if (cacheEntry === null) {
                return null;
            }
            const { staleTtl } = cacheEntry;
            return staleTtl;
        }).pipe([
            this.handleUnexpectedError(this.getExpiration.name, [keyObj]),
        ]);
    }

    getExpirationOrFail(key: string): ITask<TimeSpan> {
        return new Task(async () => {
            const expiration = await this.getExpiration(key);
            if (expiration === null) {
                throw KeyNotFoundCacheError.create(key);
            }
            return expiration;
        });
    }

    private getOrPutStatic(
        key: string,
        value: TType,
        settings?: CacheWriteSettings,
    ): ITask<TType> {
        return new Task(async () => {
            const retrievedValue = await this.get(key);
            if (retrievedValue === null) {
                await this.put(key, value, settings);
                return value;
            }
            return retrievedValue;
        });
    }

    private createLock(
        key: string,
        useNoOp: boolean,
        settings?: LockProviderCreateSettings,
    ): ILock {
        if (useNoOp) {
            return this.noOpLockProvider.create(key, settings);
        }
        return this.lockProvider.create(key, settings);
    }

    private getOrPutDynamic(
        key: string,
        dynamicValue: GetOrPutDynamic<TType>,
        settings: GetOrPutSettings = {},
    ): ITask<TType> {
        const {
            ttl,
            staleTtl,
            jitter,
            lockTtl = this.defaultLockTtl,
            lockMaxAttempts = this.defaultLockMaxAttempts,
            lockBackoffPolicy = this.defaultLockBackoffPolicy,
            forceFresh = false,
            cacheNullable = false,
        } = settings;
        return new Task<TType>(async () => {
            const isNotUsingLocks = lockTtl === null;
            const initLock = this.createLock(`${key}:init`, isNotUsingLocks, {
                ttl: lockTtl,
            });

            await new Task(async () => {
                const state = await initLock.getState();
                if (state.type !== LOCK_STATE.EXPIRED) {
                    throw StampedeCacheError.create(key);
                }
            }).pipe(
                retry({
                    errorPolicy: StampedeCacheError,
                    maxAttempts: lockMaxAttempts,
                    backoffPolicy: lockBackoffPolicy,
                }),
            );

            const [retrievedValue, expiration] = await Task.all([
                this.get(key),
                this.getExpiration(key),
            ]);

            if (retrievedValue === null || forceFresh) {
                return await initLock.runOrFail(async () => {
                    const resolvedValue = resolveGetOrPutDynamic(dynamicValue);
                    const settings = await callInvokable(resolvedValue, null);
                    const mergedSettings = {
                        ...removeUndefinedProperties({
                            cacheNullable,
                            jitter,
                            ttl,
                            staleTtl,
                        }),
                        ...removeUndefinedProperties(settings),
                    };

                    const { value, cacheNullable: cacheNullable_ } =
                        mergedSettings;
                    if (value === null && !cacheNullable_) {
                        return value;
                    }

                    const { ttl: ttl_, staleTtl: staleTtl_ } = resolveTtls(
                        mergedSettings,
                        {
                            defaultJitter: this.defaultJitter,
                            defaultStaleTtl: this.defaultStaleTtl,
                            defaultTtl: this.defaultTtl,
                            randomValue: this._mathRandom(),
                        },
                    );
                    await this.put(key, value, {
                        ttl: ttl_,
                        staleTtl: staleTtl_,
                    });
                    return value;
                });
            }

            if (expiration && expiration.toEndDate() <= new Date()) {
                const updateInBackground = new Task(async () => {
                    const refreshLock = this.createLock(
                        `${key}:refresh`,
                        isNotUsingLocks,
                        {
                            ttl: lockTtl,
                        },
                    );
                    await refreshLock.runOrFail(async () => {
                        const invokable = resolveGetOrPutDynamic(dynamicValue);
                        const settings = await callInvokable(invokable, null);
                        const mergedSettings = {
                            ...removeUndefinedProperties({
                                cacheNullable,
                                jitter,
                            }),
                            ...removeUndefinedProperties(settings),
                        };

                        const { value, cacheNullable: cacheNullable_ } =
                            mergedSettings;
                        if (value === null && !cacheNullable_) {
                            return value;
                        }

                        const { ttl: ttl_, staleTtl: staleTtl_ } = resolveTtls(
                            mergedSettings,
                            {
                                defaultJitter: this.defaultJitter,
                                defaultStaleTtl: this.defaultStaleTtl,
                                defaultTtl: this.defaultTtl,
                                randomValue: this._mathRandom(),
                            },
                        );

                        if (mergedSettings.ttl) {
                            await this.put(key, value, {
                                ttl: ttl_,
                                staleTtl: staleTtl_,
                            });
                        } else {
                            await this.adapter.update({
                                key: this.namespace.create(key).toString(),
                                value,
                                staleTtl: staleTtl_,
                            });
                        }

                        return value;
                    });
                });
                if (this.enableAsyncRefreshing) {
                    updateInBackground.detach();
                }
                try {
                    await updateInBackground;
                } catch (error: unknown) {
                    if (!(error instanceof FailedAcquireLockError)) {
                        throw error;
                    }
                }
            }

            return retrievedValue;
        });
    }

    getOrPut(
        key: string,
        value: GetOrPutValue<NoneFunc<TType>>,
        settings?: GetOrPutSettings,
    ): ITask<TType> {
        return new Task<TType>(async () => {
            if (!Task.isTask(value) && !isInvokable(value)) {
                return await this.getOrPutStatic(key, value as TType, settings);
            }
            return await this.getOrPutDynamic(
                key,
                value as GetOrPutDynamic<TType>,
                settings,
            );
        });
    }

    expire(key: string): ITask<boolean> {
        const keyObj = this.namespace.create(key);
        return new Task(async () => {
            return await this.adapter.update({
                key: keyObj.toString(),
                staleTtl: null,
            });
        });
    }

    expireOrFail(key: string): ITask<void> {
        return new Task(async () => {
            const hasExpired = await this.expire(key);
            if (!hasExpired) {
                throw KeyNotFoundCacheError.create(key);
            }
        });
    }

    getOr(
        key: string,
        defaultValue: AsyncLazyable<NoneFunc<TType>>,
    ): ITask<TType> {
        return new Task<TType>(async () => {
            const value = await this.get(key);
            if (value === null) {
                return await resolveAsyncLazyable(defaultValue);
            }
            return value;
        });
    }

    add(
        key: string,
        value: TType,
        settings: CacheWriteSettings = {},
    ): ITask<boolean> {
        const { ttl, staleTtl } = resolveTtls(settings, {
            defaultJitter: this.defaultJitter,
            defaultStaleTtl: this.defaultStaleTtl,
            defaultTtl: this.defaultTtl,
            randomValue: this._mathRandom(),
        });
        const keyObj = this.namespace.create(key);

        return new Task(async () => {
            const hasAdded = await this.adapter.add({
                key: keyObj.toString(),
                value,
                ttl,
                staleTtl,
            });
            return hasAdded;
        }).pipe([
            this.handleUnexpectedError(this.add.name, [keyObj]),
            async (args, next) => {
                const hasAdded = await next(...args);

                if (hasAdded) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: WRITTEN_CACHE_EVENT_TYPES.ADDED,
                            key: keyObj,
                            value,
                            ttl,
                        })
                        .detach();
                }

                return hasAdded;
            },
        ]);
    }

    addOrFail(
        key: string,
        value: TType,
        settings?: CacheWriteSettings,
    ): ITask<void> {
        return new Task(async () => {
            const hasAdded = await this.add(key, value, settings);
            if (!hasAdded) {
                throw KeyExistsCacheError.create(key);
            }
        });
    }

    put(
        key: string,
        value: TType,
        settings: CacheWriteSettings = {},
    ): ITask<boolean> {
        const { ttl, staleTtl } = resolveTtls(settings, {
            defaultJitter: this.defaultJitter,
            defaultStaleTtl: this.defaultStaleTtl,
            defaultTtl: this.defaultTtl,
            randomValue: this._mathRandom(),
        });
        const keyObj = this.namespace.create(key);

        return new Task(async () => {
            const hasReplaced = await this.adapter.put({
                key: keyObj.toString(),
                value,
                ttl,
                staleTtl,
            });
            return hasReplaced;
        }).pipe([
            this.handleUnexpectedError(this.put.name, [keyObj]),
            async (args, next) => {
                const hasUpdated = await next(...args);
                if (hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: WRITTEN_CACHE_EVENT_TYPES.UPDATED,
                            key: keyObj,
                            value,
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: WRITTEN_CACHE_EVENT_TYPES.ADDED,
                            key: keyObj,
                            value,
                            ttl,
                        })
                        .detach();
                }
                return hasUpdated;
            },
        ]);
    }

    update(key: string, value: TType): ITask<boolean> {
        const keyObj = this.namespace.create(key);
        return new Task(async () => {
            return await this.adapter.update({
                key: keyObj.toString(),
                value,
            });
        }).pipe([
            this.handleUnexpectedError(this.add.name, [keyObj]),
            async (args, next) => {
                const hasUpdated = await next(...args);

                if (hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: WRITTEN_CACHE_EVENT_TYPES.UPDATED,
                            key: keyObj,
                            value,
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj,
                        })
                        .detach();
                }

                return hasUpdated;
            },
        ]);
    }

    updateOrFail(key: string, value: TType): ITask<void> {
        return new Task(async () => {
            const hasUpdated = await this.update(key, value);
            if (!hasUpdated) {
                throw KeyNotFoundCacheError.create(key);
            }
        });
    }

    increment(
        key: string,
        value = 0 as Extract<TType, number>,
    ): ITask<boolean> {
        const keyObj = this.namespace.create(key);
        return new Task(async () => {
            return await this.adapter.increment({
                key: keyObj.toString(),
                value,
            });
        }).pipe([
            this.handleUnexpectedError(this.increment.name, [keyObj]),
            async (args, next) => {
                const hasUpdated = await next(...args);

                if (hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: WRITTEN_CACHE_EVENT_TYPES.INCREMENTED,
                            key: keyObj,
                            value,
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj,
                        })
                        .detach();
                }

                return hasUpdated;
            },
        ]);
    }

    incrementOrFail(key: string, value?: Extract<TType, number>): ITask<void> {
        return new Task(async () => {
            const hasIncremented = await this.increment(key, value);
            if (!hasIncremented) {
                throw KeyNotFoundCacheError.create(key);
            }
        });
    }

    decrement(
        key: string,
        value = 0 as Extract<TType, number>,
    ): ITask<boolean> {
        const keyObj = this.namespace.create(key);
        return new Task(async () => {
            return await this.adapter.increment({
                key: keyObj.toString(),
                value,
            });
        }).pipe([
            this.handleUnexpectedError(this.increment.name, [keyObj]),
            async (args, next) => {
                const hasUpdated = await next(...args);

                if (hasUpdated) {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.WRITTEN, {
                            type: WRITTEN_CACHE_EVENT_TYPES.DECREMENTED,
                            key: keyObj,
                            value,
                        })
                        .detach();
                } else {
                    this.eventBus
                        .dispatch(CACHE_EVENTS.NOT_FOUND, {
                            key: keyObj,
                        })
                        .detach();
                }

                return hasUpdated;
            },
        ]);
    }

    decrementOrFail(key: string, value?: Extract<TType, number>): ITask<void> {
        return new Task(async () => {
            const hasDecremented = await this.decrement(key, value);
            if (!hasDecremented) {
                throw KeyNotFoundCacheError.create(key);
            }
        });
    }

    remove(key: string): ITask<boolean> {
        return new Task(async () => {
            return await this.removeMany([key]);
        });
    }

    removeOrFail(key: string): ITask<void> {
        return new Task(async () => {
            const hasRemoved = await this.decrement(key);
            if (!hasRemoved) {
                throw KeyNotFoundCacheError.create(key);
            }
        });
    }

    removeMany(keys: Iterable<string>): ITask<boolean> {
        const keyObjs = [...keys].map((key) => this.namespace.create(key));
        return new Task(async () => {
            return await this.adapter.removeMany(
                keyObjs.map((keyObj) => keyObj.toString()),
            );
        }).pipe([
            this.handleUnexpectedError(this.removeMany.toString(), keyObjs),
            async (args, next) => {
                const hasRemoved = await next(...args);
                if (hasRemoved) {
                    for (const keyObj of keyObjs) {
                        this.eventBus
                            .dispatch(CACHE_EVENTS.WRITTEN, {
                                type: WRITTEN_CACHE_EVENT_TYPES.REMOVED,
                                key: keyObj,
                            })
                            .detach();
                    }
                }
                return hasRemoved;
            },
        ]);
    }

    clear(): ITask<void> {
        return new Task(async () => {
            await this.adapter.removeByKeyPrefix(this.namespace.toString());
        }).pipe([
            this.handleUnexpectedError(this.clear.name, []),
            async (args, next) => {
                // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
                const value = await next(...args);
                this.eventBus.dispatch(CACHE_EVENTS.CLEARED, {}).detach();
                return value;
            },
        ]);
    }
}
