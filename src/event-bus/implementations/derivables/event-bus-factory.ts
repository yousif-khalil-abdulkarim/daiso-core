/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module";
import type {
    IGroupableEventBus,
    IEventBusFactory,
    BaseEvent,
} from "@/event-bus/contracts/_module";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus";
import type { TimeSpan } from "@/utilities/_module";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module";
import type { EventBusAdapters } from "@/event-bus/implementations/derivables/event-bus-factory-settings";
import {
    type EventBusFactorySettings,
    EventBusFactorySettingsBuilder,
} from "@/event-bus/implementations/derivables/event-bus-factory-settings";

/**
 * @group Derivables
 * @example
 * ```ts
 * import { EventBusFactory } from "@daiso-tech/core";
 * import Redis from "ioredis"
 *
 * const eventBusFactory = new EventBusFactory({
 *   adapters: {
 *     memory: new MemoryEventBusAdapter({ rootGroup: "@global" }),
 *     redis: new RedisPubSubEventBusAdapter({
 *       dispatcherClient: new Redis(),
 *       listenerClient: new Redis(),
 *       serde: new SuperJsonSerde(),
 *       rootGroup: "@global"
 *     }),
 *   },
 *   defaultAdapter: "memory",
 * });
 * ```
 */
export class EventBusFactory<TAdapters extends string = string>
    implements IEventBusFactory<TAdapters>
{
    /**
     * @example
     * ```ts
     * import { EventBusFactory, SuperJsonSerde. MemoryEventBusAdapter, RedisPubSubEventBusAdapter, EventBus, MemoryEventBusAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis";
     *
     * const cacheFactory = new EventBusFactory(
     *   EventBusFactory
     *     .settings()
     *     .setAdapter("memory", new MemoryEventBusAdapter({
     *       rootGroup: "@global"
     *     }))
     *     .setAdapter("redis", new RedisPubSubEventBusAdapter({
     *       dispatcherClient: new Redis("YOUR_REDIS_CONNECTION"),
     *       listenerClient: new Redis("YOUR_REDIS_CONNECTION")
     *       serde: new SuperJsonSerde(),
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

    private readonly adapters: EventBusAdapters<TAdapters>;
    private readonly defaultAdapter?: TAdapters;
    private readonly retryAttempts?: number | null;
    private readonly backoffPolicy?: BackoffPolicy | null;
    private readonly retryPolicy?: RetryPolicy | null;
    private readonly timeout?: TimeSpan | null;

    constructor(settings: EventBusFactorySettings<TAdapters>) {
        const {
            adapters,
            defaultAdapter,
            retryAttempts,
            backoffPolicy,
            retryPolicy,
            timeout,
        } = settings;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.timeout = timeout;
        this.adapters = adapters;
        this.defaultAdapter = defaultAdapter;
    }

    use<TEvents extends BaseEvent = BaseEvent>(
        adapterName: TAdapters | undefined = this.defaultAdapter,
    ): IGroupableEventBus<TEvents> {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(EventBusFactory.name);
        }
        const selectedAdapter = this.adapters[adapterName];
        if (selectedAdapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        return new EventBus({
            adapter: selectedAdapter,
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            timeout: this.timeout,
        });
    }
}
