/**
 * @module Cache
 */

import type { CacheEvents, WithTtlValue } from "@/cache/contracts/_module";
import {
    KeyFoundCacheEvent,
    KeyNotFoundCacheEvent,
    KeyAddedCacheEvent,
    KeyUpdatedCacheEvent,
    KeyRemovedCacheEvent,
    KeyIncrementedCacheEvent,
    KeyDecrementedCacheEvent,
    KeysClearedCacheEvent,
    type ICache,
    type ICacheAdapter,
} from "@/cache/contracts/_module";
import {
    KeyNotFoundCacheError,
    TypeCacheError,
    UnexpectedCacheError,
} from "@/cache/contracts/_module";
import { type IGroupableCache } from "@/cache/contracts/_module";
import {
    isArrayEmpty,
    isObjectEmpty,
    simplifyAsyncLazyable,
    simplifyGroupName,
} from "@/utilities/_module";
import type {
    AsyncLazyable,
    GetOrAddValue,
    OneOrMore,
} from "@/utilities/_module";
import type { TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import { LazyPromise } from "@/async/_module";
import type {
    IGroupableEventBus,
    IEventBus,
    Listener,
    Unsubscribe,
    EventClass,
    EventInstance,
} from "@/event-bus/contracts/_module";
import {
    EventBus,
    NoOpEventBusAdapter,
} from "@/event-bus/implementations/_module";
import type { CacheSettings } from "@/cache/implementations/derivables/cache/cache-settings";
import { CacheSettingsBuilder } from "@/cache/implementations/derivables/cache/cache-settings";

/**
 * <i>Cache</i> class can be derived from any <i>{@link ICacheAdapter}</i>.
 * @group Derivables
 */
export class Cache<TType = unknown> implements IGroupableCache<TType> {
    /**
     * @example
     * ```ts
     * import { Cache, MemoryCacheAdapter, TimeSpan, SuperJsonSerde } from "@daiso-tech/core";
     *
     * const cache = new Cache(
     *   Cache
     *     .settings()
     *     .setAdapter(new MemoryCacheAdapter({ rootGroup: "@global" }))
     *     .setEventBus(new EventBus(new MemoryEventBusAdapter({ rootGroup: "@global" })))
     *     .build()
     * );
     * ```
     */
    static settings<
        TSettings extends Partial<CacheSettings>,
    >(): CacheSettingsBuilder<TSettings> {
        return new CacheSettingsBuilder();
    }

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

    private createKeyFoundEvent(
        key: string,
        value: TType,
    ): KeyFoundCacheEvent<TType> {
        return new KeyFoundCacheEvent({
            group: this.getGroup(),
            key,
            value,
        });
    }

    private createKeyNotFoundEvent(key: string): KeyNotFoundCacheEvent {
        return new KeyNotFoundCacheEvent({
            group: this.getGroup(),
            key,
        });
    }

    private createKeyAddedEvent(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): KeyAddedCacheEvent {
        return new KeyAddedCacheEvent({
            group: this.getGroup(),
            key,
            value,
            ttl,
        });
    }

    private createKeyUpdatedEvent(
        key: string,
        value: TType,
    ): KeyUpdatedCacheEvent {
        return new KeyUpdatedCacheEvent({
            group: this.getGroup(),
            key,
            value,
        });
    }

    private createKeyRemovedEvent(key: string): KeyRemovedCacheEvent {
        return new KeyRemovedCacheEvent({
            group: this.getGroup(),
            key,
        });
    }

    private createKeysClearedEvent(): KeysClearedCacheEvent {
        return new KeysClearedCacheEvent({
            group: this.getGroup(),
        });
    }

    private createKeyIncrementedEvent(
        key: string,
        value: number,
    ): KeyIncrementedCacheEvent {
        return new KeyIncrementedCacheEvent({
            group: this.getGroup(),
            key,
            value,
        });
    }

    private createKeyDecrementedEvent(
        key: string,
        value: number,
    ): KeyDecrementedCacheEvent {
        return new KeyDecrementedCacheEvent({
            group: this.getGroup(),
            key,
            value,
        });
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
            adapter: this.adapter.withGroup(simplifyGroupName(group)),
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
            const value = await this.adapter.get(key);
            if (value === null) {
                await this.eventBus.dispatch(this.createKeyNotFoundEvent(key));
            } else {
                await this.eventBus.dispatch(
                    this.createKeyFoundEvent(key, value),
                );
            }
            return value;
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
            const hasAdded = await this.adapter.add(key, value, ttl);
            if (hasAdded) {
                await this.eventBus.dispatch(
                    this.createKeyAddedEvent(key, value, ttl),
                );
            }
            return hasAdded;
        });
    }

    update(key: string, value: TType): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const hasUpdated = await this.adapter.update(key, value);
            if (hasUpdated) {
                await this.eventBus.dispatch(
                    this.createKeyUpdatedEvent(key, value),
                );
            } else {
                await this.eventBus.dispatch(this.createKeyNotFoundEvent(key));
            }
            return hasUpdated;
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
            const hasUpdated = await this.adapter.put(key, value, ttl);
            if (hasUpdated) {
                await this.eventBus.dispatch(
                    this.createKeyUpdatedEvent(key, value),
                );
            } else {
                await this.eventBus.dispatch(
                    this.createKeyAddedEvent(key, value, ttl),
                );
            }
            return hasUpdated;
        });
    }

    remove(key: string): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const hasRemoved = await this.adapter.remove(key);
            if (hasRemoved) {
                await this.eventBus.dispatch(this.createKeyRemovedEvent(key));
            } else {
                await this.eventBus.dispatch(this.createKeyNotFoundEvent(key));
            }
            return hasRemoved;
        });
    }

    increment(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const hasUpdated = await this.adapter.increment(key, value);
            if (hasUpdated) {
                if (value > 0) {
                    await this.eventBus.dispatch(
                        this.createKeyIncrementedEvent(key, value),
                    );
                }
                if (value < 0) {
                    await this.eventBus.dispatch(
                        this.createKeyDecrementedEvent(key, value),
                    );
                }
            } else {
                await this.eventBus.dispatch(this.createKeyNotFoundEvent(key));
            }
            return hasUpdated;
        });
    }

    clear(): LazyPromise<void> {
        return this.createLayPromise(async () => {
            await this.adapter.clear();
            await this.eventBus.dispatch(this.createKeysClearedEvent());
        });
    }

    exists(key: string): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            return await this.adapter.exists(key);
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
