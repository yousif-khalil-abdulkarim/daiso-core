/**
 * @module Cache
 */

import type {
    CacheEvent,
    CacheEvents,
    WithTtlValue,
} from "@/cache/contracts/_module";
import {
    KeyNotFoundCacheError,
    TypeCacheError,
    UnexpectedCacheError,
    type ICache,
    type ICacheAdapter,
} from "@/cache/contracts/_module";
import { type INamespacedCache } from "@/cache/contracts/_module";
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
import type { LazyPromiseSettings } from "@/async/_module";
import { LazyPromise } from "@/async/_module";
import type {
    INamespacedEventBus,
    IEventBus,
    AllEvents,
    Listener,
    SelectEvent,
    Unsubscribe,
} from "@/event-bus/contracts/_module";
import {
    EventBus,
    NoOpEventBusAdapter,
} from "@/event-bus/implementations/_module";

/**
 * @group Derivables
 */
export type CacheSettings<TType> = {
    /**
     * You can prefix all keys with a given <i>rootNamespace</i>.
     * This useful if you want to add multitenancy but still use the same database.
     * @default {""}
     * @example
     * ```ts
     * import { Cache, MemoryCacheAdapter } from "@daiso-tech/core";
     *
     * const memoryCacheAdapter = new MemoryCacheAdapter();
     * const cacheA = new Cache(memoryCacheAdapter, {
     *   rootNamespace: "@a"
     * });
     * const cacheB = new Cache(memoryCacheAdapter, {
     *   rootNamespace: "@b"
     * });
     *
     * (async () => {
     *   await cacheA.add("a", 1);
     *
     *   // Will be "a"
     *   console.log(await cacheA.get("a"));
     *
     *   // Will be "null"
     *   console.log(await cacheB.get("a"));
     * })();
     * ```
     */
    rootNamespace?: OneOrMore<string>;

    /**
     * In order to listen to events of <i>{@link Cache}</i> class you must pass in <i>{@link INamespacedEventBus}</i>.
     */
    eventBus?: INamespacedEventBus<CacheEvents<TType>>;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     */
    defaultTtl?: TimeSpan | null;

    lazyPromiseSettings?: LazyPromiseSettings;
};

/**
 * <i>Cache</i> class can be derived from any <i>{@link ICacheAdapter}</i>.
 * @group Derivables
 * @example
 * ```ts
 * import { Cache, MemoryCacheAdapter } from "@daiso-tech/core";
 *
 * const cache = new Cache(new MemoryCacheAdapter());
 * ```
 */
export class Cache<TType = unknown> implements INamespacedCache<TType> {
    private readonly namespace: string;
    private readonly namespacedEventBus: INamespacedEventBus<
        CacheEvents<TType>
    >;
    private readonly eventBus: IEventBus<CacheEvents<TType>>;
    private readonly cacheAdapter: ICacheAdapter<TType>;
    private readonly eventAttributes: CacheEvent;
    private readonly defaultTtl: TimeSpan | null;
    private readonly lazyPromiseSettings?: LazyPromiseSettings;

    constructor(
        cacheAdapter: ICacheAdapter<any>,
        settings: CacheSettings<TType> = {},
    ) {
        const {
            eventBus: namespacedEventBus = new EventBus(
                new NoOpEventBusAdapter(),
            ),
            defaultTtl = null,
            rootNamespace = "",
            lazyPromiseSettings,
        } = settings;
        this.lazyPromiseSettings = lazyPromiseSettings;
        this.namespacedEventBus = namespacedEventBus;
        this.namespace = simplifyGroupName(rootNamespace);
        this.eventBus = this.namespacedEventBus.withNamespace(this.namespace);
        this.cacheAdapter = cacheAdapter;
        this.defaultTtl = defaultTtl;
        this.eventAttributes = {
            adapter: this.cacheAdapter,
            namespace: this.namespace,
        };
    }

    private createLayPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ): LazyPromise<TValue> {
        return new LazyPromise(asyncFn, {
            retryPolicy: (error) => {
                return !(
                    error instanceof TypeCacheError ||
                    error instanceof KeyNotFoundCacheError
                );
            },
            ...this.lazyPromiseSettings,
        });
    }

    private createKeyFoundEvent(
        key: string,
        value: TType,
    ): AllEvents<CacheEvents<TType>> {
        return {
            type: "key_found",
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyNotFoundEvent(key: string): AllEvents<CacheEvents<TType>> {
        return {
            type: "key_not_found",
            ...this.eventAttributes,
            key,
        };
    }

    private createKeyAddedEvent(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): AllEvents<CacheEvents<TType>> {
        return {
            type: "key_added",
            ...this.eventAttributes,
            key,
            value,
            ttl,
        };
    }

    private createKeyUpdatedEvent(
        key: string,
        value: TType,
    ): AllEvents<CacheEvents<TType>> {
        return {
            type: "key_updated",
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyRemovedEvent(key: string): AllEvents<CacheEvents<TType>> {
        return {
            type: "key_removed",
            ...this.eventAttributes,
            key,
        };
    }

    private createKeysClearedEvent(): AllEvents<CacheEvents<TType>> {
        return {
            type: "keys_cleared",
            ...this.eventAttributes,
        };
    }

    private createKeyIncrementedEvent(
        key: string,
        value: number,
    ): AllEvents<CacheEvents<TType>> {
        return {
            type: "key_incremented",
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyDecrementedEvent(
        key: string,
        value: number,
    ): AllEvents<CacheEvents<TType>> {
        return {
            type: "key_decremented",
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private keyWithNamespace(key: string): string {
        return simplifyGroupName([this.namespace, key]);
    }

    withNamespace(namespace: OneOrMore<string>): ICache<TType> {
        namespace = simplifyGroupName(namespace);
        return new Cache(this.cacheAdapter, {
            defaultTtl: this.defaultTtl,
            eventBus: this.namespacedEventBus,
            rootNamespace: [this.namespace, namespace],
        });
    }

    getNamespace(): string {
        return this.namespace;
    }

    get(key: string): LazyPromise<TType | null> {
        return this.createLayPromise(async () => {
            const value = await this.cacheAdapter.get(
                this.keyWithNamespace(key),
            );
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
        ttl: TimeSpan | null = this.defaultTtl,
    ): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const hasAdded = await this.cacheAdapter.add(
                this.keyWithNamespace(key),
                value,
                ttl,
            );
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
            const hasUpdated = await this.cacheAdapter.update(
                this.keyWithNamespace(key),
                value,
            );
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
        ttl: TimeSpan | null = this.defaultTtl,
    ): LazyPromise<boolean> {
        return this.createLayPromise(async () => {
            const hasUpdated = await this.cacheAdapter.put(
                this.keyWithNamespace(key),
                value,
                ttl,
            );
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
            const hasRemoved = await this.cacheAdapter.remove(
                this.keyWithNamespace(key),
            );
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
            const hasUpdated = await this.cacheAdapter.increment(
                this.keyWithNamespace(key),
                value,
            );
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
            await this.cacheAdapter.clear(this.namespace);
            await this.eventBus.dispatch(this.createKeysClearedEvent());
        });
    }

    addListener<TEventName extends keyof CacheEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<CacheEvents, TEventName>>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(eventName, listener);
    }

    addListenerMany<TEventName extends keyof CacheEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<CacheEvents, TEventName>>,
    ): LazyPromise<void> {
        return this.eventBus.addListenerMany(eventNames, listener);
    }

    removeListener<TEventName extends keyof CacheEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<CacheEvents, TEventName>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(eventName, listener);
    }

    removeListenerMany<TEventName extends keyof CacheEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<CacheEvents, TEventName>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListenerMany(eventNames, listener);
    }

    subscribe<TEventName extends keyof CacheEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<CacheEvents, TEventName>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(eventName, listener);
    }

    subscribeMany<TEventName extends keyof CacheEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<CacheEvents, TEventName>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeMany(eventNames, listener);
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
        return new LazyPromise(async () => {
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
