/**
 * @module Cache
 */

import type { CacheEvents, WithTtlValue } from "@/cache/contracts/_module-exports";
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
} from "@/cache/contracts/_module-exports";
import {
    KeyNotFoundCacheError,
    TypeCacheError,
    UnexpectedCacheError,
} from "@/cache/contracts/_module-exports";
import { type IGroupableCache } from "@/cache/contracts/_module-exports";
import {
    isArrayEmpty,
    isObjectEmpty,
    simplifyAsyncLazyable,
    simplifyOneOrMoreStr,
} from "@/utilities/_module-exports";
import type {
    AsyncLazyable,
    GetOrAddValue,
    OneOrMore,
} from "@/utilities/_module-exports";
import type { TimeSpan } from "@/utilities/_module-exports";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports";
import { LazyPromise } from "@/async/_module-exports";
import type {
    IGroupableEventBus,
    IEventBus,
    Listener,
    Unsubscribe,
    EventClass,
    EventInstance,
} from "@/event-bus/contracts/_module-exports";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports";
import { NoOpEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports";

/**
 * @group Derivables
 */
export type CacheSettings = {
    adapter: ICacheAdapter<any>;

    /**
     * In order to listen to events of <i>{@link Cache}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus?: IGroupableEventBus<any>;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     * @default {null}
     */
    defaultTtl?: TimeSpan | null;

    /**
     * The default retry attempt to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    retryAttempts?: number | null;

    /**
     * The default backof policy to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    backoffPolicy?: BackoffPolicy | null;

    /**
     * The default retry policy to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    retryPolicy?: RetryPolicy | null;

    /**
     * The default timeout to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    timeout?: TimeSpan | null;
};

/**
 * <i>Cache</i> class can be derived from any <i>{@link ICacheAdapter}</i>.
 * @group Derivables
 */
export class Cache<TType = unknown> implements IGroupableCache<TType> {
    private static defaultRetryPolicy: RetryPolicy = (error: unknown) => {
        return !(
            error instanceof TypeCacheError ||
            error instanceof KeyNotFoundCacheError
        );
    };

    private readonly groupdEventBus: IGroupableEventBus<CacheEvents<TType>>;
    private readonly eventBus: IEventBus<CacheEvents<TType>>;
    private readonly adapter: ICacheAdapter<TType>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly retryAttempts: number | null;
    private readonly backoffPolicy: BackoffPolicy | null;
    private readonly retryPolicy: RetryPolicy | null;
    private readonly timeout: TimeSpan | null;

    /**
     *@example
     * ```ts
     * import { Cache, MemoryCacheAdapter, EventBus, MemoryEventBusAdapter, registerCacheEvents, reigsterCacheErrors, SuperJsonSerde } from "@daiso-tech/core";
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const cache = new Cache({
     *   adapter: new MemoryCacheAdapter({
     *     rootGroup: "@global"
     *   }),
     *   eventBus,
     * });
     * const serde = new SuperJsonSerde();
     * registerCacheEvents(serde);
     * reigsterCacheErrors(serde);
     * ```
     */
    constructor(settings: CacheSettings) {
        const {
            adapter,
            eventBus: groupdEventBus = new EventBus({
                adapter: new NoOpEventBusAdapter(),
            }),
            defaultTtl = null,
            retryAttempts = null,
            backoffPolicy = null,
            retryPolicy = Cache.defaultRetryPolicy,
            timeout = null,
        } = settings;
        this.groupdEventBus = groupdEventBus;
        this.eventBus = groupdEventBus.withGroup(adapter.getGroup());
        this.adapter = adapter;
        this.defaultTtl = defaultTtl;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
    }

    private createLayPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn)
            .setRetryAttempts(this.retryAttempts)
            .setBackoffPolicy(this.backoffPolicy)
            .setRetryPolicy(this.retryPolicy)
            .setTimeout(this.timeout);
    }

    addListener<TEventClass extends EventClass<CacheEvents>>(
        eventName: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    addListenerMany<TEventClass extends EventClass<CacheEvents>>(
        eventNames: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.addListenerMany(eventNames, listener);
    }

    removeListener<TEventClass extends EventClass<CacheEvents>>(
        eventName: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    removeListenerMany<TEventClass extends EventClass<CacheEvents>>(
        eventNames: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListenerMany(eventNames, listener);
    }

    listenOnce<TEventClass extends EventClass<CacheEvents>>(
        eventName: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void> {
        return this.eventBus.listenOnce(eventName, listener);
    }

    subscribe<TEventClass extends EventClass<CacheEvents>>(
        eventName: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    subscribeMany<TEventClass extends EventClass<CacheEvents>>(
        eventNames: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeMany(eventNames, listener);
    }

    withGroup(group: OneOrMore<string>): ICache<TType> {
        return new Cache({
            adapter: this.adapter.withGroup(simplifyOneOrMoreStr(group)),
            defaultTtl: this.defaultTtl,
            eventBus: this.groupdEventBus,
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            timeout: this.timeout,
        });
    }

    getGroup(): string {
        return this.adapter.getGroup();
    }

    get(key: string): LazyPromise<TType | null> {
        return this.createLayPromise(async () => {
            try {
                const value = await this.adapter.get(key);
                if (value === null) {
                    this.eventBus
                        .dispatch(
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key,
                            }),
                        )
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(
                            new KeyFoundCacheEvent({
                                group: this.getGroup(),
                                key,
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
                            key,
                            method: this.get.name,
                            error,
                        }),
                    )
                    .defer();
                throw error;
            }
        });
    }

    add(
        key: string,
        value: TType,
        /**
         * @default null
         */
        ttl: TimeSpan | null = this.defaultTtl,
    ): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            try {
                const hasAdded = await this.adapter.add(key, value, ttl);
                if (hasAdded) {
                    this.eventBus
                        .dispatch(
                            new KeyAddedCacheEvent({
                                group: this.getGroup(),
                                key,
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
                            key,
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

    update(key: string, value: TType): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            try {
                const hasUpdated = await this.adapter.update(key, value);
                if (hasUpdated) {
                    this.eventBus
                        .dispatch(
                            new KeyUpdatedCacheEvent({
                                group: this.getGroup(),
                                key,
                                value,
                            }),
                        )
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key,
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
                            key,
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

    put(
        key: string,
        value: TType,
        /**
         * @default null
         */
        ttl: TimeSpan | null = this.defaultTtl,
    ): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            try {
                const hasUpdated = await this.adapter.put(key, value, ttl);
                if (hasUpdated) {
                    this.eventBus
                        .dispatch(
                            new KeyUpdatedCacheEvent({
                                group: this.getGroup(),
                                key,
                                value,
                            }),
                        )
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(
                            new KeyAddedCacheEvent({
                                group: this.getGroup(),
                                key,
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
                            key,
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

    remove(key: string): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            try {
                const hasRemoved = await this.adapter.remove(key);
                if (hasRemoved) {
                    this.eventBus
                        .dispatch(
                            new KeyRemovedCacheEvent({
                                group: this.getGroup(),
                                key,
                            }),
                        )
                        .defer();
                } else {
                    this.eventBus
                        .dispatch(
                            new KeyNotFoundCacheEvent({
                                group: this.getGroup(),
                                key,
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
                            key,
                            method: this.remove.name,
                            error,
                        }),
                    )
                    .defer();
                throw error;
            }
        });
    }

    increment(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            try {
                const hasUpdated = await this.adapter.increment(key, value);
                if (hasUpdated && value > 0) {
                    this.eventBus
                        .dispatch(
                            new KeyIncrementedCacheEvent({
                                group: this.getGroup(),
                                key,
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
                                key,
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
                                key,
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
                            key,
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

    clear(): LazyPromise<void> {
        return this.createLayPromise(async () => {
            try {
                await this.adapter.clear();
                this.eventBus
                    .dispatch(
                        new KeysClearedCacheEvent({
                            group: this.getGroup(),
                        }),
                    )
                    .defer();
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

    exists(key: string): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const value = await this.get(key);
            return value !== null;
        });
    }

    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return this.createLayPromise(async () => {
            if (isArrayEmpty(keys)) {
                return {};
            }
            const valuePromises: PromiseLike<boolean>[] = [];
            for (const key of keys) {
                valuePromises.push(this.exists(key));
            }
            const values = await Promise.all(valuePromises);
            const result = {} as Record<string, boolean>;
            for (const [index, key] of keys.entries()) {
                const value = values[index];
                if (value === undefined) {
                    throw new UnexpectedCacheError(
                        `Item "values[${String(index)}]" is undefined`,
                    );
                }
                result[key] = value;
            }
            return result;
        });
    }

    missing(key: string): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const value = await this.get(key);
            return value === null;
        });
    }

    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return this.createLayPromise(async () => {
            if (isArrayEmpty(keys)) {
                return {};
            }
            const valuePromises: PromiseLike<boolean>[] = [];
            for (const key of keys) {
                valuePromises.push(this.missing(key));
            }
            const values = await Promise.all(valuePromises);
            const result = {} as Record<string, boolean>;
            for (const [index, key] of keys.entries()) {
                const value = values[index];
                if (value === undefined) {
                    throw new UnexpectedCacheError(
                        `Item "values[${String(index)}]" is undefined`,
                    );
                }
                result[key] = value;
            }
            return result;
        });
    }

    getMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, TType | null>> {
        return this.createLayPromise(async () => {
            if (isArrayEmpty(keys)) {
                return {};
            }
            const valuePromises: PromiseLike<TType | null>[] = [];
            for (const key of keys) {
                valuePromises.push(this.get(key));
            }
            const values = await Promise.all(valuePromises);
            const result = {} as Record<string, TType | null>;
            for (const [index, key] of keys.entries()) {
                const value = values[index];
                if (value === undefined) {
                    throw new UnexpectedCacheError(
                        `Item "values[${String(index)}]" is undefined`,
                    );
                }
                result[key] = value;
            }
            return result;
        });
    }

    getOr(key: string, defaultValue: AsyncLazyable<TType>): LazyPromise<TType> {
        return this.createLayPromise(async () => {
            const value = await this.get(key);
            if (value === null) {
                return await simplifyAsyncLazyable(defaultValue);
            }
            return value;
        });
    }

    getOrMany<TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TType>>,
    ): LazyPromise<Record<TKeys, TType>> {
        return this.createLayPromise(async () => {
            const keys = Object.keys(keysWithDefaults);
            if (isArrayEmpty(keys)) {
                return {};
            }
            const valuePromises: PromiseLike<TType>[] = [];
            for (const key of keys) {
                const defaultValue = keysWithDefaults[key as TKeys];
                valuePromises.push(this.getOr(key, defaultValue));
            }
            const values = await Promise.all(valuePromises);
            const result = {} as Record<string, TType>;
            for (const [index, key] of keys.entries()) {
                const value = values[index];
                if (value === undefined) {
                    throw new UnexpectedCacheError(
                        `Item "values[${String(index)}]" is undefined`,
                    );
                }
                result[key] = value;
            }
            return result;
        });
    }

    getOrFail(key: string): LazyPromise<TType> {
        return this.createLayPromise(async () => {
            const value = await this.get(key);
            if (value === null) {
                throw new KeyNotFoundCacheError(`Key "${key}" is not found`);
            }
            return value;
        });
    }

    addMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return this.createLayPromise(async () => {
            if (isObjectEmpty(values)) {
                return {} as Record<TKeys, boolean>;
            }
            const valuePromises: PromiseLike<boolean>[] = [];
            for (const key in values) {
                const { value, ttl } = values[key];
                valuePromises.push(this.add(key, value, ttl));
            }
            const returnValues = await Promise.all(valuePromises);
            const result = {} as Record<string, boolean>;
            for (const [index, key] of Object.keys(values).entries()) {
                const value = returnValues[index];
                if (value === undefined) {
                    throw new UnexpectedCacheError(
                        `Item "values[${String(index)}]" is undefined`,
                    );
                }
                result[key as TKeys] = value;
            }
            return result;
        });
    }

    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return this.createLayPromise(async () => {
            if (isObjectEmpty(values)) {
                return {} as Record<TKeys, boolean>;
            }
            const valuePromises: PromiseLike<boolean>[] = [];
            for (const key in values) {
                const value = values[key];
                valuePromises.push(this.update(key, value));
            }
            const returnValues = await Promise.all(valuePromises);
            const result = {} as Record<string, boolean>;
            for (const [index, key] of Object.keys(values).entries()) {
                const value = returnValues[index];
                if (value === undefined) {
                    throw new UnexpectedCacheError(
                        `Item "values[${String(index)}]" is undefined`,
                    );
                }
                result[key as TKeys] = value;
            }
            return result;
        });
    }

    putMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return this.createLayPromise(async () => {
            if (isObjectEmpty(values)) {
                return {} as Record<TKeys, boolean>;
            }
            const valuePromises: PromiseLike<boolean>[] = [];
            for (const key in values) {
                const { value, ttl } = values[key];
                valuePromises.push(this.put(key, value, ttl));
            }
            const returnValues = await Promise.all(valuePromises);
            const result = {} as Record<string, boolean>;
            for (const [index, key] of Object.keys(values).entries()) {
                const value = returnValues[index];
                if (value === undefined) {
                    throw new UnexpectedCacheError(
                        `Item "values[${String(index)}]" is undefined`,
                    );
                }
                result[key as TKeys] = value;
            }
            return result;
        });
    }

    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return this.createLayPromise(async () => {
            if (isArrayEmpty(keys)) {
                return {} as Record<TKeys, boolean>;
            }
            const valuePromises: PromiseLike<boolean>[] = [];
            for (const key of keys) {
                valuePromises.push(this.remove(key));
            }
            const values = await Promise.all(valuePromises);
            const result = {} as Record<string, boolean>;
            for (const [index, key] of keys.entries()) {
                const value = values[index];
                if (value === undefined) {
                    throw new UnexpectedCacheError(
                        `Item "values[${String(index)}]" is undefined`,
                    );
                }
                result[key] = value;
            }
            return result;
        });
    }

    getAndRemove(key: string): LazyPromise<TType | null> {
        return this.createLayPromise(async () => {
            const value = await this.get(key);
            if (value === null) {
                return null;
            }
            await this.remove(key);
            return value;
        });
    }

    getOrAdd(
        key: string,
        valueToAdd: AsyncLazyable<GetOrAddValue<TType>>,
        /**
         * @default {null}
         */
        ttl?: TimeSpan,
    ): LazyPromise<TType> {
        return this.createLayPromise(async () => {
            const value = await this.get(key);
            if (value === null) {
                const simplifiedValueToAdd = await simplifyAsyncLazyable(
                    valueToAdd as AsyncLazyable<TType>,
                );
                await this.add(key, simplifiedValueToAdd, ttl);
                return simplifiedValueToAdd;
            }
            return value;
        });
    }

    decrement(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            return await this.increment(key, -value as Extract<TType, number>);
        });
    }
}
