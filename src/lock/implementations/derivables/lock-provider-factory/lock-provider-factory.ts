/**
 * @module Lock
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module-exports.js";
import type {
    IDatabaseLockAdapter,
    ILockAdapter,
} from "@/lock/contracts/_module-exports.js";
import type { ILockProviderFactory } from "@/lock/contracts/lock-provider-factory.contract.js";
import type { IGroupableLockProvider } from "@/lock/contracts/lock-provider.contract.js";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports.js";
import type { IKeyPrefixer, TimeSpan } from "@/utilities/_module-exports.js";
import {
    LockProvider,
    type LockProviderSettingsBase,
} from "@/lock/implementations/derivables/lock-provider/_module.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/derivables"```
 * @group Derivables
 */
export type LockAdapters<TAdapters extends string> = Partial<
    Record<TAdapters, ILockAdapter | IDatabaseLockAdapter>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/derivables"```
 * @group Derivables
 */
export type LockProviderFactorySettings<TAdapters extends string> =
    LockProviderSettingsBase & {
        adapters: LockAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/derivables"```
 * @group Derivables
 */
export class LockProviderFactory<TAdapters extends string>
    implements ILockProviderFactory<TAdapters>
{
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

    setTimeout(timeout: TimeSpan): LockProviderFactory<TAdapters> {
        return new LockProviderFactory({
            ...this.settings,
            timeout,
        });
    }

    /**
     * @example
     * ```ts
     * import { LockProviderFactory } from "@daiso-tech/core/lock/implementations/derivables";
     * import { MemoryLockAdapter, RedisLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
     * import Redis from "ioredis"
     *
     * const lockProviderFactory = new LockProviderFactory({
     *   keyPrefixer: new KeyPrefixer("lock"),
     *   adapters: {
     *     memory: new MemoryLockAdapter(),
     *     redis: new RedisLockAdapter(client),
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
     *   .setTimeout(TimeSpan.fromSeconds(1));
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
        return new LockProvider({
            adapter,
            ...this.settings,
        });
    }
}
