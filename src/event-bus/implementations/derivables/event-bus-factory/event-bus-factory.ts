/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";
import {
    type IGroupableEventBus,
    type IEventBusFactory,
    type BaseEvent,
} from "@/event-bus/contracts/_module-exports.js";
import {
    EventBus,
    type EventBusAdapterFactoryable,
    type EventBusSettingsBase,
} from "@/event-bus/implementations/derivables/event-bus/_module.js";
import type { KeyPrefixer, TimeSpan } from "@/utilities/_module-exports.js";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus"```
 * @group Derivables
 */
export type EventBusAdapters<TAdapters extends string = string> = Partial<
    Record<TAdapters, EventBusAdapterFactoryable>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus"```
 * @group Derivables
 */
export type EventBusFactorySettings<TAdapters extends string = string> =
    EventBusSettingsBase & {
        adapters: EventBusAdapters<TAdapters>;

        defaultAdapter?: NoInfer<TAdapters>;
    };

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus"```
 * @group Derivables
 */
export class EventBusFactory<TAdapters extends string = string>
    implements IEventBusFactory<TAdapters>
{
    constructor(
        private readonly settings: EventBusFactorySettings<TAdapters>,
    ) {}

    setKeyPrefixer(keyPrefixer: KeyPrefixer): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            keyPrefixer,
        });
    }

    setRetryAttempts(attempts: number): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            retryAttempts: attempts,
        });
    }

    setBackoffPolicy(policy: BackoffPolicy): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            backoffPolicy: policy,
        });
    }

    setRetryPolicy(policy: RetryPolicy): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            retryPolicy: policy,
        });
    }

    setRetryTimeout(timeout: TimeSpan): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            retryTimeout: timeout,
        });
    }

    setTotalTimeout(timeout: TimeSpan): EventBusFactory<TAdapters> {
        return new EventBusFactory({
            ...this.settings,
            totalTimeout: timeout,
        });
    }

    /**
     * @example
     * ```ts
     * import { type IEventBusAdapter, BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBusFactory } from "@daiso-tech/core/event-bus";
     * import { MemoryEventBusAdapter, RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { KeyPrefixer, type IFactoryObject, type Promiseable } from "@daiso-tech/utilities";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters"
     * import Redis from "ioredis";
     *
     * class EventBusAdapterFactory implements IFactoryObject<string, IEventBusAdapter> {
     *   private store: Partial<Record<string, IEventBusAdapter>> = {};
     *
     *   async use(prefix: string): Promiseable<IEventBusAdapter> {
     *     let adapter = this.store[prefix];
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
     * const eventBusFactory = new EventBusFactory({
     *   keyPrefixer: new KeyPrefixer("event-bus"),
     *   adapters: {
     *     memory: new MemoryEventBusAdapter(),
     *     memorFactory: new EventBusAdapterFactory(),
     *     redis: new RedisPubSubEventBusAdapter({
     *       serde,
     *       dispatcherClient,
     *       listenerClient,
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
     *
     * // You can change the default settings of the returned EventBus instance.
     * await eventBusFactory
     *   .setRetryAttempts(4)
     *   .use("sqlite")
     *   .dispatch(new AddEvent({ a: 1, b: 2 }));
     *
     * // You can reuse the settings
     * const retryableEventBusFactory = eventBusFactory
     *   .setRetryAttempts(4);
     *
     * await retryableEventBusFactory
     *   .use()
     *   .dispatch(new AddEvent({ a: 1, b: 2 }));
     *
     * // You can extend the settings
     * const extendedEventBusFactory = retryableEventBusFactory
     *   .setRetryTimeout(TimeSpan.fromSeconds(1));
     *
     * await extendedEventBusFactory
     *   .use()
     *   .dispatch(new AddEvent({ a: 1, b: 2 }));
     * ```
     */
    use<TEvents extends BaseEvent = BaseEvent>(
        adapterName: TAdapters | undefined = this.settings.defaultAdapter,
    ): IGroupableEventBus<TEvents> {
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
