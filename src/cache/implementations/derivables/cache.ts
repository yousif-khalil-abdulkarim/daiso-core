/**
 * @module Cache
 */

import type { CacheEvent, CacheEvents } from "@/cache/contracts/_module";
import { type ICache, type ICacheAdapter } from "@/cache/contracts/_module";
import { type INamespacedCache } from "@/cache/contracts/_module";
import { simplifyNamespace } from "@/utilities/_module";
import type { OneOrMore } from "@/utilities/_module";
import type { TimeSpan } from "@/utilities/_module";
import type { LazyPromiseSettings } from "@/async/_module";
import type { LazyPromise } from "@/async/_module";
import type {
    INamespacedEventBus,
    IEventBus,
    AllEvents,
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
export class Cache<TType = unknown>
    extends BaseCache<TType>
    implements INamespacedCache<TType>
{
    private readonly namespace: string;
    private readonly namespacedEventBus: INamespacedEventBus<
        CacheEvents<TType>
    >;
    private readonly eventBus: IEventBus<CacheEvents<TType>>;
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
        return BaseCache.createLayPromise(async () => {
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
        return BaseCache.createLayPromise(async () => {
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
        return BaseCache.createLayPromise(async () => {
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
        return BaseCache.createLayPromise(async () => {
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
        return BaseCache.createLayPromise(async () => {
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
        return BaseCache.createLayPromise(async () => {
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
        return BaseCache.createLayPromise(async () => {
            await this.cacheAdapter.clear(this.namespace);
            await this.eventBus.dispatch(this.createKeysClearedEvent());
        });
    }
}
