/**
 * @module Cache
 */

import type {
    KeyAddedCacheEvent,
    KeyDecrementedCacheEvent,
    KeyFoundCacheEvent,
    KeyIncrementedCacheEvent,
    KeyNotFoundCacheEvent,
    KeyRemovedCacheEvent,
    KeysClearedCacheEvent,
    KeyUpdatedCacheEvent,
    CacheEvent,
} from "@/cache/contracts/_module";
import {
    CACHE_EVENTS,
    type ICache,
    type ICacheAdapter,
} from "@/cache/contracts/_module";
import {
    type INamespacedCache,
    type AllCacheEvents,
} from "@/cache/contracts/_module";
import { simplifyNamespace } from "@/_shared/utilities";
import type { OneOrMore } from "@/_shared/types";
import type { TimeSpan } from "@/utilities/_module";
import { LazyPromise } from "@/utilities/_module";
import type {
    INamespacedEventBus,
    IEventBus,
} from "@/event-bus/contracts/_module";
import {
    EventBus,
    NoOpEventBusAdapter,
} from "@/event-bus/implementations/_module";
import { BaseCache } from "@/cache/implementations/derivables/base-cache";

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
    eventBus?: INamespacedEventBus<AllCacheEvents<TType>>;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     */
    defaultTtl?: TimeSpan | null;
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
export class Cache<TType = unknown>
    extends BaseCache<TType>
    implements INamespacedCache<TType>
{
    private readonly namespace: string;
    private readonly namespacedEventBus: INamespacedEventBus<
        AllCacheEvents<TType>
    >;
    private readonly eventBus: IEventBus<AllCacheEvents<TType>>;
    private readonly cacheAdapter: ICacheAdapter<TType>;
    private readonly eventAttributes: CacheEvent;
    private readonly defaultTtl: TimeSpan | null;

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
        } = settings;
        const namespace = simplifyNamespace(rootNamespace);
        const eventBus = namespacedEventBus.withNamespace(namespace);

        super({
            namespace,
            eventBus: namespacedEventBus,
        });

        this.namespacedEventBus = namespacedEventBus;
        this.namespace = namespace;
        this.eventBus = eventBus;
        this.cacheAdapter = cacheAdapter;
        this.defaultTtl = defaultTtl;
        this.eventAttributes = {
            adapter: this.cacheAdapter,
            namespace: this.namespace,
        };
    }

    private createKeyFoundEvent(
        key: string,
        value: TType,
    ): KeyFoundCacheEvent<TType> {
        return {
            type: CACHE_EVENTS.KEY_FOUND,
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyNotFoundEvent(key: string): KeyNotFoundCacheEvent {
        return {
            type: CACHE_EVENTS.KEY_NOT_FOUND,
            ...this.eventAttributes,
            key,
        };
    }

    private createKeyAddedEvent(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): KeyAddedCacheEvent<TType> {
        return {
            type: CACHE_EVENTS.KEY_ADDED,
            ...this.eventAttributes,
            key,
            value,
            ttl,
        };
    }

    private createKeyUpdatedEvent(
        key: string,
        value: TType,
    ): KeyUpdatedCacheEvent<TType> {
        return {
            type: CACHE_EVENTS.KEY_UPDATED,
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyRemovedEvent(key: string): KeyRemovedCacheEvent {
        return {
            type: CACHE_EVENTS.KEY_REMOVED,
            ...this.eventAttributes,
            key,
        };
    }

    private createKeysClearedEvent(): KeysClearedCacheEvent {
        return {
            type: CACHE_EVENTS.KEYS_CLEARED,
            ...this.eventAttributes,
        };
    }

    private createKeyIncrementedEvent(
        key: string,
        value: number,
    ): KeyIncrementedCacheEvent {
        return {
            type: CACHE_EVENTS.KEY_INCREMENTED,
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private createKeyDecrementedEvent(
        key: string,
        value: number,
    ): KeyDecrementedCacheEvent {
        return {
            type: CACHE_EVENTS.KEY_DECREMENTED,
            ...this.eventAttributes,
            key,
            value,
        };
    }

    private keyWithNamespace(key: string): string {
        return simplifyNamespace([this.namespace, key]);
    }

    withNamespace(namespace: OneOrMore<string>): ICache<TType> {
        namespace = simplifyNamespace(namespace);
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
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
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
        return new LazyPromise(async () => {
            await this.cacheAdapter.clear(this.namespace);
            await this.eventBus.dispatch(this.createKeysClearedEvent());
        });
    }
}
