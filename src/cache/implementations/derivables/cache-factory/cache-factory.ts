/**
 * @module Cache
 */

import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports.js";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module-exports.js";
import type {
    IGroupableCache,
    ICacheFactory,
} from "@/cache/contracts/_module-exports.js";
import {
    Cache,
    type CacheSettingsBase,
    type CacheAdapterFactoryable,
} from "@/cache/implementations/derivables/cache/_module.js";
import type { KeyPrefixer, TimeSpan } from "@/utilities/_module-exports.js";
import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export type CacheAdapters<TAdapters extends string = string> = Partial<
    Record<TAdapters, CacheAdapterFactoryable<any>>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export type CacheFactorySettings<TAdapters extends string = string> =
    CacheSettingsBase & {
        adapters: CacheAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache"```
 * @group Derivables
 */
export class CacheFactory<TAdapters extends string = string>
    implements ICacheFactory<TAdapters>
{
    /**
     * @example
     * ```ts
     * ```
     */
    constructor(private readonly settings: CacheFactorySettings<TAdapters>) {}

    setKeyPrefixer(keyPrefixer: KeyPrefixer): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            keyPrefixer,
        });
    }

    setDefaultTtl(ttl: TimeSpan): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            defaultTtl: ttl,
        });
    }

    setEventBus(eventBus: IGroupableEventBus<any>): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            eventBus,
        });
    }

    setRetryAttempts(attempts: number): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            retryAttempts: attempts,
        });
    }

    setBackoffPolicy(policy: BackoffPolicy): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            backoffPolicy: policy,
        });
    }

    setRetryPolicy(policy: RetryPolicy): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            retryPolicy: policy,
        });
    }

    setRetryTimeout(timeout: TimeSpan): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            retryTimeout: timeout,
        });
    }

    setTotalTimeout(timeout: TimeSpan): CacheFactory<TAdapters> {
        return new CacheFactory({
            ...this.settings,
            totalTimeout: timeout,
        });
    }

    /**
     * @example
     * ```ts
     * import { CacheFactory } from "@daiso-tech/core/cache";
     * import { MemoryCacheAdapter, RedisCacheAdapter, SqliteCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { KeyPrefixer, TimeSpan, type IFactoryObject, type Promiseable } from "@daiso-tech/core/utilities";
     * import Redis from "ioredis"
     * import Sqlite from "better-sqlite3";
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     *
     * async function cahceAdapterFactory(prefix: string): Promiseable<SqliteCacheAdapter> {
     *   const database = new Sqlite("local.db");
     *   const cacheAdapter = new SqliteCacheAdapter({
     *     database,
     *     serde,
     *     tableName: `cache_${prefix}`
     *   });
     *   await cacheAdapter.init();
     *   return cacheAdapter;
     * }
     *
     * const cacheFactory = new CacheFactory({
     *   serde,
     *   keyPrefixer: new KeyPrefixer("cache"),
     *   adapters: {
     *     sqlite: cahceAdapterFactory,
     *     memory: new MemoryCacheAdapter(),
     *     redis: new RedisCacheAdapter({
     *       client: new Redis("YOUR_REDIS_CONNECTION"),
     *       serde,
     *     }),
     *   },
     *   defaultAdapter: "memory",
     *   eventBus,
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
     *
     * // You can reuse the settings
     * const longLivedCacheFactory = cacheFactory
     *   .setDefaultTtl(TimeSpan.fromMinutes(2));
     *
     * await longLivedCacheFactory
     *   .use()
     *   .add("a", 1);
     *
     * // You can extend the settings
     * const extendedCacheFactory = longLivedCacheFactory
     *   .setRetryTimeout(TimeSpan.fromSeconds(1));
     *
     * await extendedCacheFactory
     *   .use()
     *   .add("a", 1);
     * ```
     */
    use<TType = unknown>(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): IGroupableCache<TType> {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(CacheFactory.name);
        }
        const adapter = this.settings.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        return new Cache({
            adapter,
            ...this.settings,
        });
    }
}
