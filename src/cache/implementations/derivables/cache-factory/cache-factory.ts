/**
 * @module Cache
 */

import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module";
import {
    registerCacheErrors,
    registerCacheEvents,
    type ICacheFactory,
    type IGroupableCache,
} from "@/cache/contracts/_module";
import { Cache } from "@/cache/implementations/derivables/cache/cache";
import type { OneOrMore, TimeSpan } from "@/utilities/_module";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import type {
    CacheAdapters,
    CacheFactorySettings,
} from "@/cache/implementations/derivables/cache-factory/cache-factory-settings";
import { CacheFactorySettingsBuilder } from "@/cache/implementations/derivables/cache-factory/cache-factory-settings";
import type { IFlexibleSerde } from "@/serde/contracts/_module";

/**
 * @group Derivables
 * @internal
 */
type CacheRecord<TAdapters extends string> = Partial<
    Record<TAdapters, IGroupableCache<any>>
>;

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
     * const serde = new SuperJsonSerde();
     * const cacheFactory = new CacheFactory(
     *   CacheFactory
     *     .settings()
     *     .setEventBus(new EventBus(new MemoryEventBusAdapter({ rootGroup: "@global" })))
     *     .setAdapter("memory", new MemoryCacheAdapter({
     *       rootGroup: "@global"
     *     }))
     *     .setAdapter("redis", new RedisCacheAdapter({
     *       client: new Redis("YOUR_REDIS_CONNECTION"),
     *       serde,
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

    private readonly cacheRecord = {} as CacheRecord<TAdapters>;
    private readonly defaultAdapter?: TAdapters;
    private readonly eventBus: IGroupableEventBus<any>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly retryAttempts?: number | null;
    private readonly backoffPolicy?: BackoffPolicy | null;
    private readonly retryPolicy?: RetryPolicy | null;
    private readonly timeout?: TimeSpan | null;
    private readonly serde: OneOrMore<IFlexibleSerde>;
    private readonly shouldRegisterErrors?: boolean;
    private readonly shouldRegisterEvents?: boolean;

    /**
     * @example
     * ```ts
     * import { CacheFactory, MemoryCacheAdapter, RedisCacheAdapter, EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis"
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new SuperJsonSerde();
     * const cacheFactory = new CacheFactory({
     *   serde,
     *   adapters: {
     *     memory: new MemoryCacheAdapter({
     *       rootGroup: "@global"
     *     }),
     *     redis: new RedisCacheAdapter({
     *       client: new Redis("YOUR_REDIS_CONNECTION"),
     *       serde,
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
            shouldRegisterErrors = true,
            shouldRegisterEvents = true,
            serde,
            adapters,
            defaultAdapter,
            eventBus,
            defaultTtl = null,
            retryAttempts,
            backoffPolicy,
            retryPolicy,
            timeout,
        } = settings;

        this.shouldRegisterErrors = shouldRegisterErrors;
        this.shouldRegisterEvents = shouldRegisterEvents;
        this.serde = serde;
        this.defaultAdapter = defaultAdapter;
        this.eventBus = eventBus;
        this.defaultTtl = defaultTtl;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
        this.cacheRecord = this.init(adapters);
    }

    private init(adapters: CacheAdapters<TAdapters>): CacheRecord<TAdapters> {
        if (this.shouldRegisterErrors) {
            registerCacheErrors(this.serde);
        }
        if (this.shouldRegisterEvents) {
            registerCacheEvents(this.serde);
        }
        const cacheRecord: CacheRecord<TAdapters> = {};
        for (const key in adapters) {
            const { [key]: adapter } = adapters;
            if (adapter === undefined) {
                continue;
            }
            cacheRecord[key] = new Cache<any>({
                adapter,
                eventBus: this.eventBus,
                defaultTtl: this.defaultTtl,
                retryAttempts: this.retryAttempts,
                backoffPolicy: this.backoffPolicy,
                retryPolicy: this.retryPolicy,
                timeout: this.timeout,
            });
        }
        return cacheRecord;
    }

    use<TType = unknown>(
        adapterName: TAdapters | undefined = this.defaultAdapter,
    ): IGroupableCache<TType> {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(CacheFactory.name);
        }
        const cache = this.cacheRecord[adapterName];
        if (cache === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        return cache;
    }
}
