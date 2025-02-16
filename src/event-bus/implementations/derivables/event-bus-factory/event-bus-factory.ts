/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports";
import {
    type IEventBusAdapter,
    type IGroupableEventBus,
    type IEventBusFactory,
    type BaseEvent,
    registerEventBusErrors,
} from "@/event-bus/contracts/_module-exports";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus/event-bus";
import type { OneOrMore, TimeSpan } from "@/utilities/_module-exports";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports";

/**
 * @group Derivables
 */
export type EventBusAdapters<TAdapters extends string = string> = Partial<
    Record<TAdapters, IEventBusAdapter>
>;

/**
 * @group Derivables
 */
export type EventBusFactorySettings<TAdapters extends string = string> = {
    /**
     * You can pass one or more <i>{@link IFlexibleSerde}</i> that will be used to register all <i>{@link IGroupableEventBus}</i> related errors.
     * @default {true}
     */
    serde: OneOrMore<IFlexibleSerde>;

    /**
     * If set to true, all <i>{@link IGroupableEventBus}</i> related errors will be registered with the specified <i>IFlexibleSerde</i> during constructor initialization.
     * This ensures that all <i>{@link IGroupableEventBus}</i> related errors will be serialized correctly.
     * @default {true}
     */
    shouldRegisterErrors?: boolean;

    adapters: EventBusAdapters<TAdapters>;

    defaultAdapter?: NoInfer<TAdapters>;

    /**
     * In order to listen to events of <i>{@link Cache}</i> class you must pass in <i>{@link IGroupableEventBus}</i>.
     */
    eventBus?: IGroupableEventBus<any>;

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
type EventBusRecord<TAdapters extends string> = Partial<
    Record<TAdapters, IGroupableEventBus<any>>
>;

/**
 * @group Derivables
 */
export class EventBusFactory<TAdapters extends string = string>
    implements IEventBusFactory<TAdapters>
{
    private readonly eventBusRecord = {} as EventBusRecord<TAdapters>;
    private readonly serde: OneOrMore<IFlexibleSerde>;
    private readonly defaultAdapter?: TAdapters;
    private readonly retryAttempts?: number | null;
    private readonly backoffPolicy?: BackoffPolicy | null;
    private readonly retryPolicy?: RetryPolicy | null;
    private readonly timeout?: TimeSpan | null;
    private readonly shouldRegisterErrors?: boolean;

    /**
     * @example
     * ```ts
     * import { EventBusFactory, SuperJsonSerde. MemoryEventBusAdapter, RedisPubSubEventBusAdapter, EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis";
     * const serde = new SuperJsonSerde();
     * const cacheFactory = new EventBusFactory({
     *   serde,
     *   adapters: {
     *     memory:new MemoryEventBusAdapter({
     *       rootGroup: "@global"
     *     }),
     *     redis: new RedisPubSubEventBusAdapter({
     *       dispatcherClient: new Redis("YOUR_REDIS_CONNECTION"),
     *       listenerClient: new Redis("YOUR_REDIS_CONNECTION")
     *       serde,
     *       rootGroup: "@global"
     *     }),
     *     defaultAdapter: "memory"
     *   }
     * })
     * ```
     */
    constructor(settings: EventBusFactorySettings<TAdapters>) {
        const {
            adapters,
            shouldRegisterErrors = true,
            serde,
            defaultAdapter,
            retryAttempts,
            backoffPolicy,
            retryPolicy,
            timeout,
        } = settings;
        this.shouldRegisterErrors = shouldRegisterErrors;
        this.serde = serde;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
        this.defaultAdapter = defaultAdapter;
        this.eventBusRecord = this.init(adapters);
    }

    private init(
        adapters: EventBusAdapters<TAdapters>,
    ): EventBusRecord<TAdapters> {
        if (this.shouldRegisterErrors) {
            registerEventBusErrors(this.serde);
        }
        const eventBusRecord: EventBusRecord<TAdapters> = {};
        for (const key in adapters) {
            const { [key]: adapter } = adapters;
            if (adapter === undefined) {
                continue;
            }
            eventBusRecord[key] = new EventBus({
                adapter,
                retryAttempts: this.retryAttempts,
                backoffPolicy: this.backoffPolicy,
                retryPolicy: this.retryPolicy,
                timeout: this.timeout,
            });
        }
        return eventBusRecord;
    }

    use<TEvents extends BaseEvent = BaseEvent>(
        adapterName: TAdapters | undefined = this.defaultAdapter,
    ): IGroupableEventBus<TEvents> {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(EventBusFactory.name);
        }
        const eventBus = this.eventBusRecord[adapterName];
        if (eventBus === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        return eventBus;
    }
}
