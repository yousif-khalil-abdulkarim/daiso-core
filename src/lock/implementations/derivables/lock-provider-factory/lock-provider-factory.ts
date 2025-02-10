/**
 * @module Lock
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import type { IGroupableEventBus } from "@/event-bus/contracts/_module";
import type {
    IDatabaseLockAdapter,
    ILockAdapter,
} from "@/lock/contracts/_module";
import {
    registerLockErrorsToSerde,
    registerLockEventsToSerde,
} from "@/lock/contracts/_module";
import type { ILockProviderFactory } from "@/lock/contracts/lock-provider-factory.contract";
import type { IGroupableLockProvider } from "@/lock/contracts/lock-provider.contract";
import type { IFlexibleSerde } from "@/serde/contracts/_module";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
    type OneOrMore,
} from "@/utilities/_module";
import type { TimeSpan } from "@/utilities/_module";
import { LockProvider } from "@/lock/implementations/derivables/lock-provider/_module";

/**
 * @group Derivables
 */
export type LockAdapters<TAdapters extends string> = Partial<
    Record<TAdapters, ILockAdapter | IDatabaseLockAdapter>
>;

/**
 * @group Derivables
 */
export type LockProviderFactorySettings<TAdapters extends string> = {
    /**
     * You can pass one or more <i>{@link IFlexibleSerde}</i> that will be used to register all <i>{@link ILock}</i> related errors and events.
     * @default {true}
     */
    serde: OneOrMore<IFlexibleSerde>;

    /**
     * If set to true, all <i>{@link ILock}</i> related errors will be registered with the specified <i>IFlexibleSerde</i> during constructor initialization.
     * This ensures that all <i>{@link ILock}</i> related errors will be serialized correctly.
     * @default {true}
     */
    shouldRegisterErrors?: boolean;

    /**
     * If set to true, all <i>{@link ILock}</i> related events will be registered with the specified <i>IFlexibleSerde</i> during constructor initialization.
     * This ensures that all <i>{@link ILock}</i> related events will be serialized correctly.
     * @default {true}
     */
    shouldRegisterEvents?: boolean;

    adapters: LockAdapters<TAdapters>;

    defaultAdapter?: NoInfer<TAdapters>;

    /**
     * You can pass your owner id generator function.
     */
    createOwnerId?: () => string;

    /**
     * In order to listen to events of <i>{@link LockProvider}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus?: IGroupableEventBus<any>;

    /**
     * You can decide the default ttl value for <i>{@link ILock}</i> expiration. If null is passed then no ttl will be used by default.
     * @default TimeSpan.fromMinutes(5);
     */
    defaultTtl?: TimeSpan | null;

    /**
     * The default refreshtime used in the <i>{@link ILock}</i> <i>extend</i> method.
     * @default TimeSpan.fromMinutes(5);`
     */
    defaultExtendTime?: TimeSpan;

    /**
     * The default retry attempt to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    retryAttempts?: number | null;

    /**
     * The default backof policy to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    backoffPolicy?: BackoffPolicy | null;

    /**
     * The default retry policy to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    retryPolicy?: RetryPolicy | null;

    /**
     * The default timeout to use in the returned <i>LazyPromise</i>.
     * @default {null}
     */
    timeout?: TimeSpan | null;
};

/**
 * @internal
 */
type LockProviderRecord<TAdapters extends string> = Partial<
    Record<TAdapters, IGroupableLockProvider>
>;

/**
 * @group Derivables
 */
export class LockProviderFactory<TAdapters extends string>
    implements ILockProviderFactory<TAdapters>
{
    private readonly serde: OneOrMore<IFlexibleSerde>;
    private readonly shouldRegisterErrors?: boolean;
    private readonly shouldRegisterEvents?: boolean;
    private readonly defaultAdapter?: NoInfer<TAdapters>;
    private readonly lockProviderRecord: LockProviderRecord<TAdapters>;
    private readonly createOwnerId?: () => string;
    private readonly eventBus?: IGroupableEventBus<any>;
    private readonly defaultTtl?: TimeSpan | null;
    private readonly defaultExtendTime?: TimeSpan;
    private readonly retryAttempts?: number | null;
    private readonly backoffPolicy?: BackoffPolicy | null;
    private readonly retryPolicy?: RetryPolicy | null;
    private readonly timeout?: TimeSpan | null;

    /**
     * @example
     * ```ts
     * import { LockProviderFactory, MemoryLockAdapter, RedisLockAdapter, EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis"
     *
     * const eventBus = new EventBus({
     *   adapter: new MemoryEventBusAdapter({ rootGroup: "@global" })
     * });
     * const serde = new SuperJsonSerde();
     * const lockProviderFactory = new LockProviderFactory({
     *   serde,
     *   adapters: {
     *     memory: new MemoryLockAdapter({
     *       rootGroup: "@global"
     *     }),
     *     redis: new RedisLockAdapter({
     *       client: new Redis("YOUR_REDIS_CONNECTION"),
     *       rootGroup: "@global"
     *     }),
     *   },
     *   defaultAdapter: "memory",
     *   eventBus,
     * });
     * ```
     */
    constructor(settings: LockProviderFactorySettings<TAdapters>) {
        const {
            serde,
            shouldRegisterErrors = true,
            shouldRegisterEvents = true,
            adapters,
            defaultAdapter,
            createOwnerId,
            eventBus,
            defaultTtl,
            defaultExtendTime,
            retryAttempts,
            backoffPolicy,
            retryPolicy,
            timeout,
        } = settings;

        this.serde = serde;
        this.shouldRegisterErrors = shouldRegisterErrors;
        this.shouldRegisterEvents = shouldRegisterEvents;
        this.defaultAdapter = defaultAdapter;
        this.createOwnerId = createOwnerId;
        this.eventBus = eventBus;
        this.defaultTtl = defaultTtl;
        this.defaultExtendTime = defaultExtendTime;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
        this.lockProviderRecord = this.init(adapters);
    }

    private init(
        adapters: LockAdapters<TAdapters>,
    ): LockProviderRecord<TAdapters> {
        if (this.shouldRegisterErrors) {
            registerLockErrorsToSerde(this.serde);
        }
        if (this.shouldRegisterEvents) {
            registerLockEventsToSerde(this.serde);
        }
        const cacheRecord: LockProviderRecord<TAdapters> = {};
        for (const key in adapters) {
            const { [key]: adapter } = adapters;
            if (adapter === undefined) {
                continue;
            }
            const lockProvider = new LockProvider({
                adapter,
                serde: this.serde,
                eventBus: this.eventBus,
                defaultTtl: this.defaultTtl,
                retryAttempts: this.retryAttempts,
                backoffPolicy: this.backoffPolicy,
                retryPolicy: this.retryPolicy,
                timeout: this.timeout,
                defaultRefreshTime: this.defaultExtendTime,
                createOwnerId: this.createOwnerId,
            });
            cacheRecord[key] = lockProvider;
        }
        return cacheRecord;
    }

    use(
        adapterName: TAdapters | undefined = this.defaultAdapter,
    ): IGroupableLockProvider {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(LockProviderFactory.name);
        }
        const lockProvider = this.lockProviderRecord[adapterName];
        if (lockProvider === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        return lockProvider;
    }
}
