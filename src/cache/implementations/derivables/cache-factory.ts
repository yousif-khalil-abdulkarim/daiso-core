/**
 * @module Cache
 */

import {
    DefaultDriverNotDefinedError,
    UnregisteredDriverError,
} from "@/utilities/_module";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module";
import type {
    ICacheFactory,
    IGroupableCache,
    ICacheAdapter,
} from "@/cache/contracts/_module";
import { Cache } from "@/cache/implementations/derivables/cache";
import type { TimeSpan } from "@/utilities/_module";
import type { LazyPromiseSettings } from "@/async/_module";

/**
 * @group Derivables
 */
export type CacheDrivers<TDrivers extends string> = Partial<
    Record<TDrivers, ICacheAdapter<any>>
>;

/**
 * @group Derivables
 */
export type CacheFactorySettings<TDrivers extends string = string> = {
    drivers: CacheDrivers<TDrivers>;
    defaultDriver?: NoInfer<TDrivers>;

    /**
     * You can decide the default ttl value. If null is passed then no ttl will be used by default.
     */
    defaultTtl?: TimeSpan;

    /**
     * In order to listen to events of <i>{@link Cache}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus?: IGroupableEventBus<any>;

    lazyPromiseSettings?: LazyPromiseSettings;
};

/**
 * @group Derivables
 */
export class CacheFactory<TDrivers extends string = string>
    implements ICacheFactory<TDrivers>
{
    private readonly drivers: CacheDrivers<TDrivers>;
    private readonly defaultDriver?: TDrivers;
    private readonly eventBus?: IGroupableEventBus<any>;
    private readonly defaultTtl: TimeSpan | null;
    private readonly lazyPromiseSettings?: LazyPromiseSettings;

    /**
     * @example
     * ```ts
     * import { CacheFactory, MemoryCacheAdapter, RedisCacheAdapter, EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis"
     *
     * const eventBus = new EventBus(new MemoryEventBusAdapter("@global"));
     * const cacheFactory = new CacheFactory({
     *   drivers: {
     *     memory: new MemoryCacheAdapter("@global"),
     *     redis: new RedisCacheAdapter(new Redis("YOUR_REDIS_CONNECTION")),
     *   },
     *   defaultDriver: "memory",
     *   eventBus,
     * });
     * ```
     */
    constructor(settings: CacheFactorySettings<TDrivers>) {
        const {
            drivers,
            defaultDriver,
            eventBus,
            defaultTtl = null,
            lazyPromiseSettings,
        } = settings;
        this.drivers = drivers;
        this.defaultDriver = defaultDriver;
        this.eventBus = eventBus;
        this.defaultTtl = defaultTtl;
        this.lazyPromiseSettings = lazyPromiseSettings;
    }

    use<TType = unknown>(
        driverName: TDrivers | undefined = this.defaultDriver,
    ): IGroupableCache<TType> {
        if (driverName === undefined) {
            throw new DefaultDriverNotDefinedError(CacheFactory.name);
        }
        const driver = this.drivers[driverName];
        if (driver === undefined) {
            throw new UnregisteredDriverError(driverName);
        }
        return new Cache<TType>(driver, {
            eventBus: this.eventBus,
            defaultTtl: this.defaultTtl,
            lazyPromiseSettings: this.lazyPromiseSettings,
        });
    }
}
