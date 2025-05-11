/**
 * @module Cache
 */

import {
    DefaultAdapterNotDefinedError,
    resolveOneOrMore,
    UnregisteredAdapterError,
    type AsyncLazy,
    type Factory,
} from "@/utilities/_module-exports.js";
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";
import type {
    ICache,
    ICacheFactory,
} from "@/cache/contracts/_module-exports.js";
import {
    Cache,
    type CacheSettingsBase,
    type CacheAdapter,
} from "@/cache/implementations/derivables/cache/_module.js";
import { Namespace, type TimeSpan } from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export type CacheAdapters<TAdapters extends string = string> = Partial<
    Record<TAdapters, CacheAdapter<any>>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export type CacheFactorySettings<TAdapters extends string = string> =
    CacheSettingsBase & {
        adapters: CacheAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 * The `CacheFactory` class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache"`
 * @group Derivables
 */
export class CacheFactory<TAdapters extends string = string>
    implements ICacheFactory<TAdapters>
{
    /**
     * @example
     * ```ts
     * import { CacheFactory } from "@daiso-tech/core/cache";
     * import { MemoryCacheAdapter, RedisCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import type { ISerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Namespace } from "@daiso-tech/core/utilities";
     * import Redis from "ioredis"
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheFactory = new CacheFactory({
     *   namespace: new Namespace("cache"),
     *   adapters: {
     *     memory: new MemoryCacheAdapter(),
     *     redis: new RedisCacheAdapter({
     *       database: new Redis("YOUR_REDIS_CONNECTION"),
     *       serde,
     *     }),
     *   },
     *   defaultAdapter: "memory",
     * });
     */
    constructor(private readonly settings: CacheFactorySettings<TAdapters>) {}

    setNamespace(namespace: Namespace): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            namespace,
        });
    }

    setDefaultTtl(ttl: TimeSpan): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            defaultTtl: ttl,
        });
    }

    setEventBus(eventBus: IEventBus): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            eventBus,
        });
    }

    setLazyPromiseFactory(
        factory: Factory<AsyncLazy<any>, LazyPromise<any>>,
    ): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            lazyPromiseFactory: factory,
        });
    }

    /**
     * @example
     * ```ts
     * import { CacheFactory } from "@daiso-tech/core/cache";
     * import { MemoryCacheAdapter, RedisCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import type { ISerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Namespace, TimeSpan } from "@daiso-tech/core/utilities";
     * import Redis from "ioredis"
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheFactory = new CacheFactory({
     *   namespace: new Namespace("cache"),
     *   adapters: {
     *     memory: new MemoryCacheAdapter(),
     *     redis: new RedisCacheAdapter({
     *       database: new Redis("YOUR_REDIS_CONNECTION"),
     *       serde,
     *     }),
     *   },
     *   defaultAdapter: "memory",
     * });
     *
     * // Will add key to cache using the default adapter which is MemoryCacheAdapter
     * await cacheFactory
     *   .use()
     *   .add("a", 1);
     *
     * // Will add key to cache using the redis adapter which is RedisCacheAdapter
     * await cacheFactory
     *   .use("redis")
     *   .add("a", 1);
     *
     * // You can change the default settings of the returned Cache instance.
     * await cacheFactory
     *   .setDefaultTtl(TimeSpan.fromMinutes(2))
     *   .use("sqlite")
     *   .add("a", 1);
     * ```
     */
    use<TType = unknown>(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): ICache<TType> {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(CacheFactory.name);
        }
        const adapter = this.settings.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        const { namespace } = this.settings;
        return new Cache({
            ...this.settings,
            adapter,
            namespace: new Namespace([
                ...resolveOneOrMore(namespace._getInternal().original),
                adapterName,
            ]),
        });
    }
}
