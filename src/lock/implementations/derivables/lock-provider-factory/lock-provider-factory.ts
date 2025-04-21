/**
 * @module Lock
 */
import type { IEventBus } from "@/event-bus/contracts/_module-exports.js";
import type {
    ILockProviderFactory,
    ILockProvider,
} from "@/lock/contracts/_module-exports.js";
import {
    DefaultAdapterNotDefinedError,
    Namespace,
    resolveOneOrMore,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports.js";
import type {
    AsyncLazy,
    Factory,
    TimeSpan,
} from "@/utilities/_module-exports.js";
import {
    LockProvider,
    type LockAdapter,
    type LockProviderSettingsBase,
} from "@/lock/implementations/derivables/lock-provider/_module.js";
import type { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export type LockAdapters<TAdapters extends string> = Partial<
    Record<TAdapters, LockAdapter>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export type LockProviderFactorySettings<TAdapters extends string> =
    LockProviderSettingsBase & {
        adapters: LockAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 * The `LockProviderFactory` class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock"`
 * @group Derivables
 */
export class LockProviderFactory<TAdapters extends string>
    implements ILockProviderFactory<TAdapters>
{
    /**
     * @example
     * ```ts
     * import { LockProviderFactory } from "@daiso-tech/core/lock";
     * import type { IDatabaseLockAdapter } from "@daiso-tech/core/lock/contracts";
     * import { MemoryLockAdapter, RedisLockAdapter, SqliteLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Namespace, type ISqliteDatabase, type AsyncFactoryFn } from "@daiso-tech/core/utilities";
     * import Redis from "ioredis"
     * import Sqlite from "better-sqlite3";
     *
     * function lockAdapterFactory(database: ISqliteDatabase): AsyncFactoryFn<string, IDatabaseLockAdapter> {
     *   return async (prefix) => {
     *     const lockAdapter = new SqliteLockAdapter({
     *       database,
     *       tableName: `lock_${prefix}`
     *     });
     *     await lockAdapter.init();
     *     return lockAdapter;
     *   }
     * }
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const lockProviderFactory = new LockProviderFactory({
     *   serde,
     *   namespace: new Namespace("lock"),
     *   adapters: {
     *     sqlite: lockAdapterFactory(database),
     *     memory: new MemoryLockAdapter(),
     *     redis: new RedisLockAdapter({
     *       client: new Redis("YOUR_REDIS_CONNECTION"),
     *       serde,
     *     }),
     *   },
     *   defaultAdapter: "memory",
     * });
     * ```
     */
    constructor(
        private readonly settings: LockProviderFactorySettings<TAdapters>,
    ) {}

    setNamespace(namespace: Namespace): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            namespace,
        });
    }

    setCreateOwnerId(createId: () => string): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            createOwnerId: createId,
        });
    }

    setEventBus(eventBus: IEventBus): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            eventBus,
        });
    }

    setDefaultTtl(ttl: TimeSpan): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            defaultTtl: ttl,
        });
    }

    setDefaultBlockingInterval(
        interval: TimeSpan,
    ): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            defaultBlockingInterval: interval,
        });
    }

    setDefaultBlockingTime(time: TimeSpan): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            defaultBlockingTime: time,
        });
    }

    setDefaultRefreshTime(time: TimeSpan): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            defaultRefreshTime: time,
        });
    }

    setLazyPromiseFactory(
        factory: Factory<AsyncLazy<any>, LazyPromise<any>>,
    ): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            lazyPromiseFactory: factory,
        });
    }

    /**
     * @example
     * ```ts
     * import { LockProviderFactory } from "@daiso-tech/core/lock";
     * import type { IDatabaseLockAdapter } from "@daiso-tech/core/lock/contracts";
     * import { MemoryLockAdapter, RedisLockAdapter, SqliteLockAdapter } from "@daiso-tech/core/lock/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
     * import { Namespace, TimeSpan, type ISqliteDatabase, type AsyncFactoryFn } from "@daiso-tech/core/utilities";
     * import Redis from "ioredis"
     * import Sqlite from "better-sqlite3";
     *
     * function lockAdapterFactory(database: ISqliteDatabase): AsyncFactoryFn<string, IDatabaseLockAdapter> {
     *   return async (prefix) => {
     *     const lockAdapter = new SqliteLockAdapter({
     *       database,
     *       tableName: `lock_${prefix}`
     *     });
     *     await lockAdapter.init();
     *     return lockAdapter;
     *   }
     * }
     *
     * const database = new Sqlite("local.db");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const lockProviderFactory = new LockProviderFactory({
     *   serde,
     *   namespace: new Namespace("lock"),
     *   adapters: {
     *     sqlite: lockAdapterFactory(database),
     *     memory: new MemoryLockAdapter(),
     *     redis: new RedisLockAdapter({
     *       client: new Redis("YOUR_REDIS_CONNECTION"),
     *       serde,
     *     }),
     *   },
     *   defaultAdapter: "memory",
     * });
     *
     * // Will acquire key using the default adapter which is MemoryLockAdapter
     * await lockProviderFactory
     *   .use()
     *   .create("a")
     *   .acquire();
     *
     * // Will acquire key using the redis adapter which is RedisLockAdapter
     * await lockProviderFactory
     *   .use("redis")
     *   .create("a")
     *   .acquire();
     *
     * // You can change the default settings of the returned Lock instance.
     * await lockProviderFactory
     *   .setDefaultTtl(TimeSpan.fromMinutes(2))
     *   .use("sqlite")
     *   .create("a")
     *   .acquire();
     * ```
     */
    use(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): ILockProvider {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(LockProviderFactory.name);
        }
        const adapter = this.settings.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        const { namespace } = this.settings;
        return new LockProvider({
            ...this.settings,
            adapter,
            namespace: new Namespace([
                ...resolveOneOrMore(namespace.original),
                adapterName,
            ]),
            serdeTransformerName: adapterName,
        });
    }
}
