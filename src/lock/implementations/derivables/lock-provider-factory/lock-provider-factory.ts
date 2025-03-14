/**
 * @module Lock
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module-exports.js";
import type {
    ILockProviderFactory,
    IGroupableLockProvider,
} from "@/lock/contracts/_module-exports.js";
import {
    DefaultAdapterNotDefinedError,
    KeyPrefixer,
    resolveOneOrMore,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports.js";
import type { IKeyPrefixer, TimeSpan } from "@/utilities/_module-exports.js";
import {
    LockProvider,
    type LockAdapterFactoryable,
    type LockProviderSettingsBase,
} from "@/lock/implementations/derivables/lock-provider/_module.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
 * @group Derivables
 */
export type LockAdapters<TAdapters extends string> = Partial<
    Record<TAdapters, LockAdapterFactoryable>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
 * @group Derivables
 */
export type LockProviderFactorySettings<TAdapters extends string> =
    LockProviderSettingsBase & {
        adapters: LockAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock"```
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
     * import { KeyPrefixer, type ISqliteDatabase, type AsyncFactoryFn } from "@daiso-tech/core/utilities";
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
     *   keyPrefixer: new KeyPrefixer("lock"),
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

    setKeyPrefixer(keyPrefixer: IKeyPrefixer): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            keyPrefixer,
        });
    }

    setCreateOwnerId(createId: () => string): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            createOwnerId: createId,
        });
    }

    setEventBus(
        eventBus: IGroupableEventBus<any>,
    ): LockProviderFactory<TAdapters> {
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

    setRetryAttempts(attempts: number): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            retryAttempts: attempts,
        });
    }

    setBackoffPolicy(policy: BackoffPolicy): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            backoffPolicy: policy,
        });
    }

    setRetryPolicy(policy: RetryPolicy): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            retryPolicy: policy,
        });
    }

    setRetryTimeout(timeout: TimeSpan): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            retryTimeout: timeout,
        });
    }

    setTotalTimeout(timeout: TimeSpan): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            totalTimeout: timeout,
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
     * import { KeyPrefixer, TimeSpan, type ISqliteDatabase, type AsyncFactoryFn } from "@daiso-tech/core/utilities";
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
     *   keyPrefixer: new KeyPrefixer("lock"),
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
     *
     * // You can reuse the settings
     * const longLivedLockProviderFactory = lockProviderFactory
     *   .setDefaultTtl(TimeSpan.fromMinutes(2));
     *
     * await longLivedLockProviderFactory
     *   .use()
     *   .create("a")
     *   .acquire();
     *
     * // You can extend the settings
     * const extendedLockProviderFactory = longLivedLockProviderFactory
     *   .setRetryTimeout(TimeSpan.fromSeconds(1));
     *
     * await extendedLockProviderFactory
     *   .use()
     *   .create("a")
     *   .acquire();
     * ```
     */
    use(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): IGroupableLockProvider {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(LockProviderFactory.name);
        }
        const adapter = this.settings.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        const { keyPrefixer } = this.settings;
        return new LockProvider({
            ...this.settings,
            adapter,
            keyPrefixer: new KeyPrefixer([
                ...resolveOneOrMore(keyPrefixer.originalRootPrefix),
                adapterName,
            ]),
            serdeTransformerName: adapterName,
        });
    }
}
