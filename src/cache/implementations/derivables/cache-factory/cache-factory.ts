/**
 * @module Cache
 */

import {
    DefaultAdapterNotDefinedError,
    resolveOneOrMore,
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
import { KeyPrefixer, type TimeSpan } from "@/utilities/_module-exports.js";
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
     * import type { ICacheAdapter } from "@daiso-tech/core/cache/contracts";
     * import { MemoryCacheAdapter, RedisCacheAdapter, SqliteCacheAdapter } from "@daiso-tech/core/cache/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import type { ISerde } from "@daiso-tech/core/serde/contracts";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { KeyPrefixer, TimeSpan, type ISqliteDatabase, type FactoryFn } from "@daiso-tech/core/utilities";
     * import Redis from "ioredis"
     * import Sqlite from "better-sqlite3";
     *
     * function cahceAdapterFactory(database: ISqliteDatabase, serde: ISerde<string>): FactoryFn<string, ICacheAdapter> {
     *   return async (prefix) => {
     *     const cacheAdapter = new SqliteCacheAdapter({
     *       database,
     *       serde,
     *       tableName: `cache_${prefix}`
     *     });
     *     await cacheAdapter.init();
     *     return cacheAdapter;
     *   }
     * }
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const cacheFactory = new CacheFactory({
     *   serde,
     *   keyPrefixer: new KeyPrefixer("cache"),
     *   adapters: {
     *     sqlite: cahceAdapterFactory(database, serde),
     *     memory: new MemoryCacheAdapter(),
     *     redis: new RedisCacheAdapter({
     *       client: new Redis("YOUR_REDIS_CONNECTION"),
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
        const { keyPrefixer } = this.settings;
        return new Cache({
            ...this.settings,
            adapter,
            keyPrefixer: new KeyPrefixer([
                ...resolveOneOrMore(keyPrefixer.originalRootPrefix),
                adapterName,
            ]),
        });
    }
}
