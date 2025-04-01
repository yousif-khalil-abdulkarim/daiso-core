/**
 * @module EventBus
 */

import type { LazyPromise } from "@/async/_module-exports.js";
import {
    type IEventBus,
    type IEventBusFactory,
    type BaseEvent,
    type IEventBusAdapter,
} from "@/event-bus/contracts/_module-exports.js";
import {
    EventBus,
    type EventBusSettingsBase,
} from "@/event-bus/implementations/derivables/event-bus/_module.js";
import type {
    AsyncLazy,
    Factory,
    KeyPrefixer,
} from "@/utilities/_module-exports.js";
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
export type EventBusFactorySettings<TAdapters extends string = string> =
    EventBusSettingsBase & {
        adapters: EventBusAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 * The `EventBusFactory` class is immutable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus"`
 * @group Derivables
 */
export class EventBusFactory<TAdapters extends string = string>
    implements IEventBusFactory<TAdapters>
{
    /**
     * @example
     * ```ts
     * import { type IEventBusAdapter, BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBusFactory } from "@daiso-tech/core/event-bus";
     * import { MemoryEventBusAdapter, RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { KeyPrefixer, type FactoryFn } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters"
     * import Redis from "ioredis";
     *
     * type Store = Partial<Record<string, IEventBusAdapter>>;
     *
     * function cahceAdapterFactory(store: Store): FactoryFn<string, IEventBusAdapter> {
     *   return (prefix) => {
     *     let adapter = store[prefix];
     *     if (adapter === undefined) {
     *       adapter = new MemoryEventBusAdapter();
     *       store[prefix] = adapter;
     *     }
     *     return adapter;
     *   }
     * }
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const store: Store = {};
     * const eventBusFactory = new EventBusFactory({
     *   keyPrefixer: new KeyPrefixer("event-bus"),
     *   adapters: {
     *     memory: new MemoryEventBusAdapter(),
     *     memoryFactory: cahceAdapterFactory(store),
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
        private readonly settings: EventBusFactorySettings<TAdapters>,
    ) {}

    setKeyPrefixer(keyPrefixer: KeyPrefixer): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            keyPrefixer,
        });
    }

    setLazyPromiseFactory(
        factory: Factory<AsyncLazy<any>, LazyPromise<any>>,
    ): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            lazyPromiseFactory: factory,
        });
    }

    /**
     * @example
     * ```ts
     * import { type IEventBusAdapter, BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBusFactory } from "@daiso-tech/core/event-bus";
     * import { MemoryEventBusAdapter, RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { KeyPrefixer, type FactoryFn } from "@daiso-tech/core/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters"
     * import Redis from "ioredis";
     *
     * type Store = Partial<Record<string, IEventBusAdapter>>;
     *
     * function cahceAdapterFactory(store: Store): FactoryFn<string, IEventBusAdapter> {
     *   return (prefix) => {
     *     let adapter = store[prefix];
     *     if (adapter === undefined) {
     *       adapter = new MemoryEventBusAdapter();
     *       store[prefix] = adapter;
     *     }
     *     return adapter;
     *   }
     * }
     *
     * const dispatcherClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const listenerClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const store: Store = {};
     * const eventBusFactory = new EventBusFactory({
     *   keyPrefixer: new KeyPrefixer("event-bus"),
     *   adapters: {
     *     memory: new MemoryEventBusAdapter(),
     *     memoryFactory: cahceAdapterFactory(store),
     *     redis: new RedisPubSubEventBusAdapter({
     *       serde,
     *       dispatcherClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
     *       listenerClient: new Redis("YOUR_REDIS_CONNECTION_STRING"),
     *     }),
     *   },
     *   defaultAdapter: "memory"
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     *
     * // Will dispatch AddEvent using the default adapter which is MemoryEventBusAdapter
     * await eventBusFactory
     *   .use()
     *   .dispatch(new AddEvent({ a: 1, b: 2 }));
     *
     * // Will dispatch AddEvent using the redis adapter which is RedisPubSubEventBusAdapter
     * await eventBusFactory
     *   .use("redis")
     *   .dispatch(new AddEvent({ a: 1, b: 2 }));
     * ```
     */
    use<TEvents extends BaseEvent = BaseEvent>(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): IEventBus<TEvents> {
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
