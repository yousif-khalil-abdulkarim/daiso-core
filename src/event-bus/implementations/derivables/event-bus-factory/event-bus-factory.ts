/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import {
    type IGroupableEventBus,
    type IEventBusFactory,
    type BaseEvent,
    registerEventBusErrors,
} from "@/event-bus/contracts/_module";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus/event-bus";
import type { OneOrMore, TimeSpan } from "@/utilities/_module";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module";
import type { EventBusAdapters } from "@/event-bus/implementations/derivables/event-bus-factory/event-bus-factory-settings";
import {
    type EventBusFactorySettings,
    EventBusFactorySettingsBuilder,
} from "@/event-bus/implementations/derivables/event-bus-factory/event-bus-factory-settings";
import type { IFlexibleSerde } from "@/serde/contracts/_module";

/**
 * @internal
 */
type EventBusRecord<TAdapters extends string> = Partial<
    Record<TAdapters, IGroupableEventBus<any>>
>;

export class EventBusFactory<TAdapters extends string = string>
    implements IEventBusFactory<TAdapters>
{
    /**
     * @example
     * ```ts
     * import { EventBusFactory, SuperJsonSerde. MemoryEventBusAdapter, RedisPubSubEventBusAdapter, EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis";
     *
     * const serde = new SuperJsonSerde();
     * const cacheFactory = new EventBusFactory(
     *   EventBusFactory
     *     .settings()
     *     .setSerde(serde)
     *     .setAdapter("memory", new MemoryEventBusAdapter({
     *       rootGroup: "@global"
     *     }))
     *     .setAdapter("redis", new RedisPubSubEventBusAdapter({
     *       dispatcherClient: new Redis("YOUR_REDIS_CONNECTION"),
     *       listenerClient: new Redis("YOUR_REDIS_CONNECTION")
     *       serde,
     *       rootGroup: "@global"
     *     }))
     *     .setDefaultAdapter("memory")
     *     .build()
     * );
     * ```
     */
    static settings<
        TAdapters extends string,
        TSettings extends EventBusFactorySettings<TAdapters>,
    >(): EventBusFactorySettingsBuilder<TSettings> {
        return new EventBusFactorySettingsBuilder();
    }

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
