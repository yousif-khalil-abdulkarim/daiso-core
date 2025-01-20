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

    /**
     * You can prefix all keys with a given <i>rootGroup</i>.
     */
    rootGroup?: string;
};

/**
 * @group Derivables
 * @example
 * ```ts
 * import { CacheFactory } from "@daiso-tech/core";
 * import Redis from "ioredis"
 *
 * const cacheFactory = new CacheFactory({
 *   drivers: {
 *     memory: new MemoryCacheAdapter(),
 *     redis: new RedisCacheAdapter(new Redis()),
 *   },
 *   defaultDriver: "memory",
 *   rootGroup: "@events"
 * });
 * ```
 */
export class CacheFactory<TDrivers extends string = string, TType = unknown>
    implements ICacheFactory<TDrivers, TType>
{
    private readonly rootGroup?: string;
    private readonly drivers: CacheDrivers<TDrivers>;
    private readonly defaultDriver?: TDrivers;
    private readonly eventBus?: IGroupableEventBus<any>;
    private defaultTtl: TimeSpan | null;

    constructor(settings: CacheFactorySettings<TDrivers>) {
        const {
            drivers,
            defaultDriver,
            eventBus,
            rootGroup,
            defaultTtl = null,
        } = settings;
        this.drivers = drivers;
        this.defaultDriver = defaultDriver;
        this.eventBus = eventBus;
        this.rootGroup = rootGroup;
        this.defaultTtl = defaultTtl;
    }

    use(
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
            rootGroup: this.rootGroup,
            defaultTtl: this.defaultTtl,
        });
    }

    withType<TOutput extends TType = TType>(): ICacheFactory<
        TDrivers,
        TOutput
    > {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this as any;
    }
}
