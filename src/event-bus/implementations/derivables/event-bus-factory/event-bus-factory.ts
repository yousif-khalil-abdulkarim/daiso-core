/**
 * @module EventBus
 */

import type { BackoffPolicy, RetryPolicy } from "@/async/_module-exports.js";
import {
    type IEventBusAdapter,
    type IGroupableEventBus,
    type IEventBusFactory,
    type BaseEvent,
    registerEventBusErrors,
} from "@/event-bus/contracts/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus/event-bus.js";
import type { OneOrMore, TimeSpan } from "@/utilities/_module-exports.js";
import {
    DefaultAdapterNotDefinedError,
    UnregisteredAdapterError,
} from "@/utilities/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/derivables"```
 * @group Derivables
 */
export type EventBusAdapters<TAdapters extends string = string> = Partial<
    Record<TAdapters, IEventBusAdapter>
>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/derivables"```
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
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/derivables"```
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
     * import { EventBusFactory } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter, RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import Redis from "ioredis";
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
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
     * });
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

    /**
     * @example
     * ```ts
     * import { BaseEvent } from "@daiso-tech/core/event-bus/contracts";
     * import { EventBusFactory } from "@daiso-tech/core/event-bus/implementations/derivables";
     * import { MemoryEventBusAdapter, RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import Redis from "ioredis";
     *
     * const serde = new Serde(new SuperJsonSerdeAdapter());
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
     * });
     *
     * class AddEvent extends BaseEvent<{ a: number, b: number }> {}
     * serde.registerEvent(AddEvent);
     *
     * // Will use the default adapter which is MemoryEventBusAdapter
     * await cacheFactory.use().dispatch(new AddEvent({ a: 1, b: 2 }));
     *
     * // Will use the redis dapter which is RedisPubSubEventBusAdapter
     * await cacheFactory.use("redis").dispatch(new AddEvent({ a: 1, b: 2 }));
     * ```
     */
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
