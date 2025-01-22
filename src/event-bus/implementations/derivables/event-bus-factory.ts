/**
 * @module EventBus
 */

import type { LazyPromiseSettings } from "@/async/_module";
import type {
    IGroupableEventBus,
    IEventBusAdapter,
    IEventBusFactory,
    BaseEvents,
} from "@/event-bus/contracts/_module";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus";
import {
    DefaultDriverNotDefinedError,
    UnregisteredDriverError,
} from "@/utilities/_module";

/**
 * @group Derivables
 */
export type EventBusDrivers<TAdapters extends string = string> = Partial<
    Record<TAdapters, IEventBusAdapter>
>;

/**
 * @group Derivables
 */
export type EventBusFactorySettings<TAdapters extends string = string> = {
    drivers: EventBusDrivers<TAdapters>;
    defaultDriver?: NoInfer<TAdapters>;
    rootGroup?: string;
};

/**
 * @group Derivables
 * @example
 * ```ts
 * import { EventBusFactory } from "@daiso-tech/core";
 * import Redis from "ioredis"
 *
 * const eventBusFactory = new EventBusFactory({
 *   drivers: {
 *     memory: new MemoryEventBusAdapter(),
 *     redis: new RedisPubSubEventBusAdapter({
 *       dispatcherClient: new Redis(),
 *       listenerClient: new Redis(),
 *     }),
 *   },
 *   defaultDriver: "memory",
 * });
 * ```
 */
export class EventBusFactory<
    TAdapters extends string = string,
    TEvents extends BaseEvents = BaseEvents,
> implements IEventBusFactory<TAdapters, TEvents>
{
    private readonly drivers: EventBusDrivers<TAdapters>;
    private readonly defaultDriver?: TAdapters;
    private readonly lazyPromiseSettings?: LazyPromiseSettings;

    constructor(settings: EventBusFactorySettings<TAdapters>) {
        const { drivers, defaultDriver } = settings;
        this.drivers = drivers;
        this.defaultDriver = defaultDriver;
    }

    use(
        driverName: TAdapters | undefined = this.defaultDriver,
    ): IGroupableEventBus<TEvents> {
        if (driverName === undefined) {
            throw new DefaultDriverNotDefinedError(EventBusFactory.name);
        }
        const selectedAdapter = this.drivers[driverName];
        if (selectedAdapter === undefined) {
            throw new UnregisteredDriverError(driverName);
        }
        return new EventBus(selectedAdapter, {
            lazyPromiseSettings: this.lazyPromiseSettings,
        });
    }

    withType<TOutput extends BaseEvents = TEvents>(): IEventBusFactory<
        TAdapters,
        TOutput
    > {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return this as any;
    }
}
