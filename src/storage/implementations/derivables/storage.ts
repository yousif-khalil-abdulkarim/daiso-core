/**
 * @module Storage
 */

import type {
    KeyAddedStorageEvent,
    KeyDecrementedStorageEvent,
    KeyFoundStorageEvent,
    KeyIncrementedStorageEvent,
    KeyNotFoundStorageEvent,
    KeyRemovedStorageEvent,
    KeysClearedStorageEvent,
    KeyUpdatedStorageEvent,
    StorageEvent,
    StorageEventNames,
} from "@/storage/contracts/_module";
import {
    KeyNotFoundStorageError,
    STORAGE_EVENTS,
    UnexpectedStorageError,
    type IStorage,
    type IStorageAdapter,
} from "@/storage/contracts/_module";
import {
    type INamespacedStorage,
    type AllStorageEvents,
} from "@/storage/contracts/_module";
import {
    isArrayEmpty,
    isObjectEmpty,
    simplifyAsyncLazyable,
    simplifyNamespace,
} from "@/_shared/utilities";
import type { OneOrMore } from "@/_shared/types";
import { type AsyncLazyable, type GetOrAddValue } from "@/_shared/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Validator, zodValidator } from "@/utilities/_module";
import { LazyPromise } from "@/utilities/_module";
import type {
    INamespacedEventBus,
    IEventBus,
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
export type StorageSettings<TType> = {
    /**
     * You can prefix all keys with a given <i>rootNamespace</i>.
     * This useful if you want to add multitenancy but still use the same database.
     * @default {""}
     * @example
     * ```ts
     * import { Storage, MemoryStorageAdapter } from "@daiso-tech/core";
     *
     * const memoryStorageAdapter = new MemoryStorageAdapter();
     * const storageA = new Storage(memoryStorageAdapter, {
     *   rootNamespace: "@a"
     * });
     * const storageB = new Storage(memoryStorageAdapter, {
     *   rootNamespace: "@b"
     * });
     *
     * (async () => {
     *   await storageA.add("a", 1);
     *
     *   // Will be "a"
     *   console.log(await storageA.get("a"));
     *
     *   // Will be "null"
     *   console.log(await storageB.get("a"));
     * })();
     * ```
     */
    rootNamespace?: OneOrMore<string>;

    /**
     * You can pass a custom <i>{@link Validator}</i> to validate, transform and sanitize your data.
     * You could also use <i>{@link zodValidator}</i> which enables you to use zod for validating, transforming, and sanitizing.
     * @example
     * ```ts
     * import { Storage, MemoryStorageAdapter, zodValidator } from "@daiso-tech/core";
     * import { z } from "zod";
     *
     * const storage = new Storage(new MemoryStorageAdapter(), {
     *   // Type will be infered from validator
     *   validator: zodValidator(z.string())
     * });
     *
     * (async () => {
     *   // An Typescript error will be seen and ValidationError will be thrown during runtime.
     *   await storageA.add("a", 1);
     * })();
     * ```
     */
    validator?: Validator<TType>;

    /**
     * In order to listen to events of <i>{@link Storage}</i> class you must pass in <i>{@link INamespacedEventBus}</i>.
     */
    eventBus?: INamespacedEventBus<AllStorageEvents<TType>>;
};

/**
 * <i>Storage</i> class can be derived from any <i>{@link IStorageAdapter}</i>.
 * @group Derivables
 */
export class Storage<TType = unknown> implements INamespacedStorage<TType> {
    private readonly namespace: string;
    private readonly validator: Validator<TType>;
    private readonly eventBus: IEventBus<AllStorageEvents<TType>>;
    private readonly storageAdapter: IStorageAdapter<TType>;
    private readonly eventAttributes: StorageEvent;

    constructor(
        storageAdapter: IStorageAdapter<any>,
        settings: StorageSettings<TType> = {},
    ) {
        const {
            validator = (v) => v as TType,
            eventBus = new EventBus(new NoOpEventBusAdapter()),
        } = settings;
        let { rootNamespace: namespace = "" } = settings;

        namespace = simplifyNamespace(namespace);
        this.namespace = namespace;
        this.validator = validator;
        this.eventBus = eventBus.withNamespace(this.namespace);
        this.storageAdapter = storageAdapter;
        this.eventAttributes = {
            adapter: this.storageAdapter,
            namespace: this.namespace,
        };
    }

    addListener<TEventType extends StorageEventNames>(
        event: TEventType,
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): LazyPromise<void> {
        return this.eventBus.addListener(event, listener);
    }

    addListenerMany<TEventType extends StorageEventNames>(
        events: TEventType[],
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): LazyPromise<void> {
        return this.eventBus.addListenerMany(events, listener);
    }

    removeListener<TEventType extends StorageEventNames>(
        event: TEventType,
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListener(event, listener);
    }

    removeListenerMany<TEventType extends StorageEventNames>(
        events: TEventType[],
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): LazyPromise<void> {
        return this.eventBus.removeListenerMany(events, listener);
    }

    subscribe<TEventType extends StorageEventNames>(
        event: TEventType,
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribe(event, listener);
    }

    subscribeMany<TEventType extends StorageEventNames>(
        events: TEventType[],
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): LazyPromise<Unsubscribe> {
        return this.eventBus.subscribeMany(events, listener);
    }

    withNamespace(namespace: OneOrMore<string>): IStorage<TType> {
        namespace = simplifyNamespace(namespace);
        return new Storage(this.storageAdapter, {
            validator: this.validator,
            rootNamespace: [this.namespace, namespace],
        });
    }

    getNamespace(): string {
        return this.namespace;
    }

    private createKeyFoundEvent(
        key: string,
        value: TType,
    ): KeyFoundStorageEvent<TType> {
        return {
            type: STORAGE_EVENTS.KEY_FOUND,
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyNotFoundEvent(key: string): KeyNotFoundStorageEvent {
        return {
            type: STORAGE_EVENTS.KEY_NOT_FOUND,
            ...this.eventAttributes,
            key,
        };
    }

    private createKeyAddedEvent(
        key: string,
        value: TType,
    ): KeyAddedStorageEvent<TType> {
        return {
            type: STORAGE_EVENTS.KEY_ADDED,
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyUpdatedEvent(
        key: string,
        value: TType,
    ): KeyUpdatedStorageEvent<TType> {
        return {
            type: STORAGE_EVENTS.KEY_UPDATED,
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyRemovedEvent(key: string): KeyRemovedStorageEvent {
        return {
            type: STORAGE_EVENTS.KEY_REMOVED,
            ...this.eventAttributes,
            key,
        };
    }

    private createKeysClearedEvent(): KeysClearedStorageEvent {
        return {
            type: STORAGE_EVENTS.KEYS_CLEARED,
            ...this.eventAttributes,
        };
    }

    private createKeyIncrementedEvent(
        key: string,
        value: number,
    ): KeyIncrementedStorageEvent {
        return {
            type: STORAGE_EVENTS.KEY_INCREMENTED,
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyDecrementedEvent(
        key: string,
        value: number,
    ): KeyDecrementedStorageEvent {
        return {
            type: STORAGE_EVENTS.KEY_DECREMENTED,
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private keyWithNamespace(key: string): string {
        return simplifyNamespace([this.namespace, key]);
    }

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
                    throw new UnexpectedStorageError("!!__message__!!");
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
                    throw new UnexpectedStorageError("!!__message__!!");
                }
                result[key] = value;
            }
            return result;
        });
    }

    get(key: string): LazyPromise<TType | null> {
        return new LazyPromise(async () => {
            const value = await this.storageAdapter.get(
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
                    throw new UnexpectedStorageError("!!__message__!!");
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
                    throw new UnexpectedStorageError("!!__message__!!");
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
                throw new KeyNotFoundStorageError(`Key "${key}" is not found`);
            }
            return value;
        });
    }

    add(key: string, value: TType): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const hasAdded = await this.storageAdapter.add(
                this.keyWithNamespace(key),
                this.validator(value),
            );
            if (hasAdded) {
                await this.eventBus.dispatch(
                    this.createKeyAddedEvent(key, value),
                );
            }
            return hasAdded;
        });
    }

    addMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            if (isObjectEmpty(values)) {
                return {} as Record<TKeys, boolean>;
            }
            const valuePromises: PromiseLike<boolean>[] = [];
            for (const key in values) {
                const value = values[key];
                valuePromises.push(this.add(key, value));
            }
            const returnValues = await Promise.all(valuePromises);
            const result = {} as Record<string, boolean>;
            for (const [index, key] of Object.keys(values).entries()) {
                const value = returnValues[index];
                if (value === undefined) {
                    throw new UnexpectedStorageError("!!__message__!!");
                }
                result[key as TKeys] = value;
            }
            return result;
        });
    }

    update(key: string, value: TType): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const hasUpdated = await this.storageAdapter.update(
                this.keyWithNamespace(key),
                this.validator(value),
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
                    throw new UnexpectedStorageError("!!__message__!!");
                }
                result[key as TKeys] = value;
            }
            return result;
        });
    }

    put(key: string, value: TType): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const hasUpdated = await this.storageAdapter.put(
                this.keyWithNamespace(key),
                this.validator(value),
            );
            if (hasUpdated) {
                await this.eventBus.dispatch(
                    this.createKeyUpdatedEvent(key, value),
                );
            } else {
                await this.eventBus.dispatch(
                    this.createKeyAddedEvent(key, value),
                );
            }
            return hasUpdated;
        });
    }

    putMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            if (isObjectEmpty(values)) {
                return {} as Record<TKeys, boolean>;
            }
            const valuePromises: PromiseLike<boolean>[] = [];
            for (const key in values) {
                const value = values[key];
                valuePromises.push(this.put(key, value));
            }
            const returnValues = await Promise.all(valuePromises);
            const result = {} as Record<string, boolean>;
            for (const [index, key] of Object.keys(values).entries()) {
                const value = returnValues[index];
                if (value === undefined) {
                    throw new UnexpectedStorageError("!!__message__!!");
                }
                result[key as TKeys] = value;
            }
            return result;
        });
    }

    remove(key: string): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const hasRemoved = await this.storageAdapter.remove(
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
                    throw new UnexpectedStorageError("!!__message__!!");
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
    ): LazyPromise<TType> {
        return new LazyPromise(async () => {
            const value = await this.get(key);
            if (value === null) {
                const simplifiedValueToAdd = await simplifyAsyncLazyable(
                    valueToAdd as AsyncLazyable<TType>,
                );
                await this.add(key, simplifiedValueToAdd);
                return simplifiedValueToAdd;
            }
            return value;
        });
    }

    increment(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const hasUpdated = await this.storageAdapter.increment(
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

    decrement(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            return await this.increment(key, -value as Extract<TType, number>);
        });
    }

    clear(): LazyPromise<void> {
        return new LazyPromise(async () => {
            await this.storageAdapter.clear(this.namespace);
            await this.eventBus.dispatch(this.createKeysClearedEvent());
        });
    }
}
