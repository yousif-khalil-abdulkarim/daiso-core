/**
 * @module Cache
 */

import type { CacheEventNames, WithTtlValue } from "@/cache/contracts/_module";
import {
    KeyNotFoundCacheError,
    UnexpectedCacheError,
    type ICache,
} from "@/cache/contracts/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type ICacheAdapter,
    type INamespacedCache,
    type AllCacheEvents,
} from "@/cache/contracts/_module";
import {
    isArrayEmpty,
    isObjectEmpty,
    simplifyAsyncLazyable,
} from "@/_shared/utilities";
import type { OneOrMore } from "@/_shared/types";
import { type AsyncLazyable, type GetOrAddValue } from "@/_shared/types";
import type { TimeSpan } from "@/utilities/_module";
import { LazyPromise } from "@/utilities/_module";
import type {
    Listener,
    SelectEvent,
    Unsubscribe,
    INamespacedEventBus,
    IListenable,
} from "@/event-bus/contracts/_module";

/**
 * @group Derivables
 */
export type BaseCacheSettings<TType> = {
    namespace: string;
    eventBus: INamespacedEventBus<AllCacheEvents<TType>>;
};

/**
 * The BaseCache class serves as an abstract base class that provides implementations for redundant methods.
 * It simplifies implementing the {@link INamespacedCache} interface without using an {@link ICacheAdapter}.
 * @group Derivables
 */
export abstract class BaseCache<TType> implements INamespacedCache<TType> {
    private readonly listenable: IListenable<AllCacheEvents<TType>>;

    constructor(settings: BaseCacheSettings<TType>) {
        const { eventBus, namespace } = settings;
        this.listenable = eventBus.withNamespace(namespace);
    }

    addListener<TEventType extends CacheEventNames>(
        event: TEventType,
        listener: Listener<SelectEvent<AllCacheEvents<TType>, TEventType>>,
    ): LazyPromise<void> {
        return this.listenable.addListener(event, listener);
    }

    addListenerMany<TEventType extends CacheEventNames>(
        events: TEventType[],
        listener: Listener<SelectEvent<AllCacheEvents<TType>, TEventType>>,
    ): LazyPromise<void> {
        return this.listenable.addListenerMany(events, listener);
    }

    removeListener<TEventType extends CacheEventNames>(
        event: TEventType,
        listener: Listener<SelectEvent<AllCacheEvents<TType>, TEventType>>,
    ): LazyPromise<void> {
        return this.listenable.removeListener(event, listener);
    }

    removeListenerMany<TEventType extends CacheEventNames>(
        events: TEventType[],
        listener: Listener<SelectEvent<AllCacheEvents<TType>, TEventType>>,
    ): LazyPromise<void> {
        return this.listenable.removeListenerMany(events, listener);
    }

    subscribe<TEventType extends CacheEventNames>(
        event: TEventType,
        listener: Listener<SelectEvent<AllCacheEvents<TType>, TEventType>>,
    ): LazyPromise<Unsubscribe> {
        return this.listenable.subscribe(event, listener);
    }

    subscribeMany<TEventType extends CacheEventNames>(
        events: TEventType[],
        listener: Listener<SelectEvent<AllCacheEvents<TType>, TEventType>>,
    ): LazyPromise<Unsubscribe> {
        return this.listenable.subscribeMany(events, listener);
    }

    abstract withNamespace(namespace: OneOrMore<string>): ICache<TType>;

    abstract getNamespace(): string;

    exists(key: string): LazyPromise<boolean> {
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
            const value = await this.get(key);
            return value === null;
        });
    }

    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
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

    abstract get(key: string): LazyPromise<TType | null>;

    getMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, TType | null>> {
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
            const value = await this.get(key);
            if (value === null) {
                throw new KeyNotFoundCacheError(`Key "${key}" is not found`);
            }
            return value;
        });
    }

    abstract add(
        key: string,
        value: TType,
        ttl?: TimeSpan | null,
    ): LazyPromise<boolean>;

    addMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
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

    abstract update(key: string, value: TType): LazyPromise<boolean>;

    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
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

    abstract put(
        key: string,
        value: TType,
        ttl?: TimeSpan | null,
    ): LazyPromise<boolean>;

    putMany<TKeys extends string>(
        values: Record<TKeys, WithTtlValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
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

    abstract remove(key: string): LazyPromise<boolean>;

    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
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

    abstract increment(
        key: string,
        value?: Extract<TType, number>,
    ): LazyPromise<boolean>;

    decrement(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            return await this.increment(key, -value as Extract<TType, number>);
        });
    }

    abstract clear(): LazyPromise<void>;
}
