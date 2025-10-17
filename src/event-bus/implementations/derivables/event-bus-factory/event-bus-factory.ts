/**
 * @module EventBus
 */

import type { Task } from "@/task/_module-exports.js";
import {
    type IEventBus,
    type IEventBusFactory,
    type BaseEventMap,
    type IEventBusAdapter,
} from "@/event-bus/contracts/_module-exports.js";
import {
    EventBus,
    type EventBusSettingsBase,
    type EventMapSchema,
} from "@/event-bus/implementations/derivables/event-bus/_module.js";
import type { Namespace } from "@/namespace/_module-exports.js";
import type { AsyncLazy, Factory } from "@/utilities/_module-exports.js";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus"`
 * @group Derivables
 */
export type EventBusAdapters<TAdapters extends string = string> = Partial<
    Record<TAdapters, IEventBusAdapter>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus"`
 * @group Derivables
 */
export type EventBusFactorySettings<
    TAdapters extends string = string,
    TEventMap extends BaseEventMap = BaseEventMap,
> = EventBusSettingsBase<TEventMap> & {
    adapters: EventBusAdapters<TAdapters>;

    defaultAdapter?: NoInfer<TAdapters>;
};

/**
 * The `EventBusFactory` class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus"`
 * @group Derivables
 */
export class EventBusFactory<
    TAdapters extends string = string,
    TEventMap extends BaseEventMap = BaseEventMap,
> implements IEventBusFactory<TAdapters, TEventMap>
{
    /**
     * @example
     * ```ts
     * import { type IEventBusAdapter, BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBusFactory } from "@daiso-tech/core/event-bus";
     * import { MemoryEventBusAdapter, RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { type FactoryFn } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters"
     * import Redis from "ioredis";
     *
     * type Store = Partial<Record<string, IEventBusAdapter>>;
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const store: Store = {};
     * const eventBusFactory = new EventBusFactory({
     *   adapters: {
     *     memory: new MemoryEventBusAdapter(),
     *     redis: new RedisPubSubEventBusAdapter({
     *       serde,
     *       dispatcherClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
     *       listenerClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
     *     }),
     *   },
     *   defaultAdapter: "memory"
     * });
     * ```
     */
    constructor(
        private readonly settings: EventBusFactorySettings<
            TAdapters,
            TEventMap
        >,
    ) {}

    setNamespace(namespace: Namespace): EventBusFactory<TAdapters, TEventMap> {
        return new EventBusFactory({
            ...this.settings,
            namespace,
        });
    }

    setTaskFactory(
        factory: Factory<AsyncLazy<any>, Task<any>>,
    ): EventBusFactory<TAdapters, TEventMap> {
        return new EventBusFactory({
            ...this.settings,
            lazyPromiseFactory: factory,
        });
    }

    setEventMapType<TEventMap extends BaseEventMap>(): EventBusFactory<
        TAdapters,
        TEventMap
    > {
        return new EventBusFactory({
            ...this.settings,
        } as EventBusFactorySettings<TAdapters, TEventMap>);
    }

    setEventMapSchema<TEventMap extends BaseEventMap>(
        eventMapSchema: EventMapSchema<TEventMap>,
    ): EventBusFactory<TAdapters, TEventMap> {
        return new EventBusFactory({
            ...this.settings,
            eventMapSchema,
        });
    }

    /**
     * @example
     * ```ts
     * import { type IEventBusAdapter, BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBusFactory } from "@daiso-tech/core/event-bus";
     * import { MemoryEventBusAdapter, RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { type FactoryFn } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters"
     * import Redis from "ioredis";
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const eventBusFactory = new EventBusFactory({
     *   adapters: {
     *     memory: new MemoryEventBusAdapter(),
     *     redis: new RedisPubSubEventBusAdapter({
     *       serde,
     *       dispatcherClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
     *       listenerClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
     *     }),
     *   },
     *   defaultAdapter: "memory"
     * });
     *
     * type AddEvent = {
     *   a: number;
     *   b: number;
     * };
     * type EventMap = {
     *   add: AddEvent;
     * };
     *
     * // Will dispatch AddEvent using the default adapter which is MemoryEventBusAdapter
     * await eventBusFactory
     *   .use<EventMap>()
     *   .dispatch("add", { a: 1, b: 2 });
     *
     * // Will dispatch AddEvent using the redis adapter which is RedisPubSubEventBusAdapter
     * await eventBusFactory
     *   .use<EventMap>("redis")
     *   .dispatch("add", { a: 1, b: 2 });
     * ```
     */
    use(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): IEventBus<TEventMap> {
        if (adapterName === undefined) {
            throw new DefaultAdapterNotDefinedError(EventBusFactory.name);
        }
        const adapter = this.settings.adapters[adapterName];
        if (adapter === undefined) {
            throw new UnregisteredAdapterError(adapterName);
        }
        return new EventBus({
            adapter,
            ...this.settings,
        });
    }
}
