/**
 * @module Cache
 */

import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module";
import type { ICacheFactory, IGroupableCache } from "@/cache/contracts/_module";
import { Cache } from "@/cache/implementations/derivables/cache";
import type { TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import type {
    CacheAdapters,
    CacheFactorySettings,
} from "@/cache/implementations/derivables/cache-factory-settings";
import { CacheFactorySettingsBuilder } from "@/cache/implementations/derivables/cache-factory-settings";

/**
 * @group Derivables
 */
export class CacheFactory<TAdapters extends string = string>
    implements ICacheFactory<TAdapters>
{
    /**
     * @example
     * ```ts
     * import { CacheFactory, SuperJsonSerde. MemoryCacheAdapter, RedisCacheAdapter, EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis";
     *
     * const cacheFactory = new CacheFactory(
     *   CacheFactory
     *     .settings()
     *     .setEventBus(new EventBus(new MemoryEventBusAdapter({ rootGroup: "@global" })))
     *     .setAdapter("memory", new MemoryCacheAdapter({
     *       rootGroup: "@global"
     *     }))
     *     .setAdapter("redis", new RedisCacheAdapter({
     *       client: new Redis("YOUR_REDIS_CONNECTION"),
     *       serde: new SuperJsonSerde(),
     *       rootGroup: "@global"
     *     }))
     *     .setDefaultAdapter("memory")
     *     .build()
     * );
     * ```
     */
    static settings<
        TAdapters extends string,
        TSettings extends CacheFactorySettings<TAdapters>,
    >(): CacheFactorySettingsBuilder<TSettings> {
        return new CacheFactorySettingsBuilder();
    }

    private readonly adapters: CacheAdapters<TAdapters>;
    private readonly defaultAdapter?: TAdapters;
    private readonly eventBus?: IGroupableEventBus<any>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly retryAttempts?: number | null;
    private readonly backoffPolicy?: BackoffPolicy | null;
    private readonly retryPolicy?: RetryPolicy | null;
    private readonly timeout?: TimeSpan | null;

    /**
     * @example
     * ```ts
     * import { CacheFactory, MemoryCacheAdapter, RedisCacheAdapter, EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis"
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const cacheFactory = new CacheFactory({
     *   adapters: {
     *     memory: new MemoryCacheAdapter({
     *       rootGroup: "@global"
     *     }),
     *     redis: new RedisCacheAdapter({
     *       client: new Redis("YOUR_REDIS_CONNECTION"),
     *       serde: new SuperJsonSerde(),
     *       rootGroup: "@global"
     *     }),
     *   },
     *   defaultAdapter: "memory",
     *   eventBus,
     * });
     * ```
     */
    constructor(settings: CacheFactorySettings<TAdapters>) {
        const {
            adapters,
            defaultAdapter,
            eventBus,
            defaultTtl = null,
            retryAttempts,
            backoffPolicy,
            retryPolicy,
            timeout,
        } = settings;
        this.adapters = adapters;
        this.defaultAdapter = defaultAdapter;
        this.eventBus = eventBus;
        this.defaultTtl = defaultTtl;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
    }

    use<TType = unknown>(
        adapterName: TAdapters | undefined = this.defaultAdapter,
    ): IGroupableCache<TType> {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(CacheFactory.name);
        }
        const adapter = this.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        return new Cache<TType>({
            adapter: adapter,
            eventBus: this.eventBus,
            defaultTtl: this.defaultTtl,
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            timeout: this.timeout,
        });
    }
}
