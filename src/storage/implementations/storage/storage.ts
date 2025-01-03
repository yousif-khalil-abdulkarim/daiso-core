/**
 * @module Storage
 */

import {
    KeyNotFoundStorageError,
    STORAGE_EVENTS,
    UnexpectedStorageError,
    type IStorage,
    type IStorageAdapter,
} from "@/storage/contracts/_module";
import {
    type StorageValue,
    type INamespacedStorage,
    type AllStorageEvents,
} from "@/storage/contracts/_module";
import { WithNamespaceStorageAdapter } from "@/storage/implementations/storage/with-namespace-storage-adapter";
import {
    isArrayEmpty,
    isObjectEmpty,
    simplifyAsyncLazyable,
} from "@/_shared/utilities";
import { type AsyncLazyable, type GetOrAddValue } from "@/_shared/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Validator, zodValidator } from "@/utilities/_module";
import { LazyPromise } from "@/utilities/_module";
import { WithValidationStorageAdapter } from "@/storage/implementations/storage/with-validation-storage-adapter";
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
import { WithEventStorageAdapter } from "@/storage/implementations/storage/with-event-storage-adapter";

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
     * const storageA = new Storage(new MemoryStorageAdapter(), {
     *   rootNamespace: "@a/"
     * });
     * const storageB = new Storage(new MemoryStorageAdapter(), {
     *   rootNamespace: "@b/"
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
    rootNamespace?: string;

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

    eventBus?: INamespacedEventBus<AllStorageEvents<TType>>;
};

/**
 * <i>Storage</i> class can be derived from any <i>{@link IStorageAdapter}</i>.
 * @group Derivables
 */
export class Storage<TType = unknown> implements INamespacedStorage<TType> {
    static EVENTS = STORAGE_EVENTS;

    private readonly withEventStorageAdapter: WithEventStorageAdapter<TType>;
    private readonly namespace_: string;
    private readonly validator: Validator<TType>;
    private readonly eventBus: IEventBus<AllStorageEvents<TType>>;

    constructor(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private readonly storageAdapter: IStorageAdapter<any>,
        settings: StorageSettings<TType> = {},
    ) {
        const {
            rootNamespace: namespace = "",
            validator = (v) => v as TType,
            eventBus = new EventBus(new NoOpEventBusAdapter()),
        } = settings;

        this.namespace_ = namespace;
        this.validator = validator;
        this.eventBus = eventBus.withNamespace(this.namespace_);

        const withValidationStorageAdapter = new WithValidationStorageAdapter(
            this.storageAdapter,
            this.validator,
        );
        const withNamespaceStorageAdapter =
            new WithNamespaceStorageAdapter<TType>(
                withValidationStorageAdapter,
                this.namespace_,
            );
        this.withEventStorageAdapter = new WithEventStorageAdapter(
            withNamespaceStorageAdapter,
            this.eventBus,
            {
                adapter: this.storageAdapter,
                namespace: this.namespace_,
            },
        );
    }

    addListener<TEventType extends AllStorageEvents<TType>["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): PromiseLike<void> {
        return this.eventBus.addListener(event, listener);
    }

    addListenerMany<TEventType extends AllStorageEvents<TType>["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): PromiseLike<void> {
        return this.eventBus.addListenerMany(events, listener);
    }

    removeListener<TEventType extends AllStorageEvents<TType>["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): PromiseLike<void> {
        return this.eventBus.removeListener(event, listener);
    }

    removeListenerMany<TEventType extends AllStorageEvents<TType>["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): PromiseLike<void> {
        return this.eventBus.removeListenerMany(events, listener);
    }

    subscribe<TEventType extends AllStorageEvents<TType>["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): PromiseLike<Unsubscribe> {
        return this.eventBus.subscribe(event, listener);
    }

    subscribeMany<TEventType extends AllStorageEvents<TType>["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<AllStorageEvents<TType>, TEventType>>,
    ): PromiseLike<Unsubscribe> {
        return this.eventBus.subscribeMany(events, listener);
    }

    withNamespace(namespace: string): IStorage<TType> {
        return new Storage(this.storageAdapter, {
            validator: this.validator,
            rootNamespace: `${this.namespace_}${namespace}`,
        });
    }

    getNamespace(): string {
        return this.namespace_;
    }

    exists(key: string): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasKey } = await this.existsMany([key]);
            if (hasKey === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasKey;
        });
    }

    existsMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            const getResult = await this.getMany(keys);
            const results = {} as Record<TKeys, boolean>;
            for (const key in getResult) {
                results[key] = getResult[key] !== null;
            }
            return results;
        });
    }

    missing(key: string): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasKey } = await this.missingMany([key]);
            if (hasKey === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasKey;
        });
    }

    missingMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            return Object.fromEntries(
                Object.entries(await this.existsMany(keys)).map(
                    ([key, hasKey]) => [key, !hasKey],
                ),
            ) as Record<TKeys, boolean>;
        });
    }

    get(key: string): LazyPromise<TType | null> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getMany<string>([key]);
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
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
                return {} as Record<TKeys, TType | null>;
            }
            return await this.withEventStorageAdapter.getMany(keys);
        });
    }

    getOr(key: string, defaultValue: AsyncLazyable<TType>): LazyPromise<TType> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getOrMany<string>({
                [key]: defaultValue,
            });
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return value as TType;
        });
    }

    getOrMany<TKeys extends string>(
        keysWithDefaults: Record<TKeys, AsyncLazyable<TType>>,
    ): LazyPromise<Record<TKeys, TType>> {
        return new LazyPromise(async () => {
            const getManyResult = await this.getMany(
                Object.keys(keysWithDefaults),
            );
            const result = {} as Record<string, TType>;
            for (const key in getManyResult) {
                const { [key]: value } = getManyResult;
                if (value === undefined) {
                    throw new UnexpectedStorageError(
                        `Destructed field "key" is undefined`,
                    );
                }
                if (value === null) {
                    const defaultValue = keysWithDefaults[key as TKeys];
                    result[key] = (await simplifyAsyncLazyable(
                        defaultValue,
                    )) as TType;
                } else {
                    result[key] = value as TType;
                }
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

    add(key: string, value: StorageValue<TType>): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasAdded } = await this.addMany<string>({
                [key]: value,
            });
            if (hasAdded === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasAdded;
        });
    }

    addMany<TKeys extends string>(
        values: Record<TKeys, StorageValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            if (isObjectEmpty(values)) {
                return {} as Record<TKeys, boolean>;
            }
            return await this.withEventStorageAdapter.addMany(values);
        });
    }

    update(key: string, value: TType): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasKey } = await this.updateMany({
                [key]: value,
            });
            if (hasKey === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasKey;
        });
    }

    updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            if (isObjectEmpty(values)) {
                return {} as Record<TKeys, boolean>;
            }
            return await this.withEventStorageAdapter.updateMany(values);
        });
    }

    put(key: string, value: StorageValue<TType>): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasAdded } = await this.putMany<string>({
                [key]: value,
            });
            if (hasAdded === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasAdded;
        });
    }

    putMany<TKeys extends string>(
        values: Record<TKeys, StorageValue<TType>>,
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            if (isObjectEmpty(values)) {
                return {} as Record<TKeys, boolean>;
            }
            return await this.withEventStorageAdapter.putMany(values);
        });
    }

    remove(key: string): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            const { [key]: hasAdded } = await this.removeMany([key]);
            if (hasAdded === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            return hasAdded;
        });
    }

    removeMany<TKeys extends string>(
        keys: TKeys[],
    ): LazyPromise<Record<TKeys, boolean>> {
        return new LazyPromise(async () => {
            if (isArrayEmpty(keys)) {
                return {} as Record<TKeys, boolean>;
            }
            return await this.withEventStorageAdapter.removeMany(keys);
        });
    }

    getAndRemove(key: string): LazyPromise<TType | null> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getMany<string>([key]);
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            await this.withEventStorageAdapter.removeMany([key]);
            return value;
        });
    }

    getOrAdd(
        key: string,
        valueToAdd: AsyncLazyable<StorageValue<GetOrAddValue<TType>>>,
    ): LazyPromise<TType> {
        return new LazyPromise(async () => {
            const { [key]: value } = await this.getMany<string>([key]);
            if (value === undefined) {
                throw new UnexpectedStorageError(
                    `Destructed field "key" is undefined`,
                );
            }
            if (value === null) {
                const valueToAddSimplified = (await simplifyAsyncLazyable(
                    valueToAdd,
                )) as TType;
                await this.withEventStorageAdapter.addMany({
                    [key]: valueToAddSimplified,
                });
                return valueToAddSimplified;
            }
            return value;
        });
    }

    increment(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            return await this.withEventStorageAdapter.increment(key, value);
        });
    }

    decrement(
        key: string,
        value = 1 as Extract<TType, number>,
    ): LazyPromise<boolean> {
        return new LazyPromise(async () => {
            return await this.withEventStorageAdapter.increment(key, -value);
        });
    }

    clear(): LazyPromise<void> {
        return new LazyPromise(async () => {
            await this.withEventStorageAdapter.clear();
        });
    }
}
