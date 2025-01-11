/**
 * @module EventBus
 */

import type { Validator } from "@/utilities/_module";
import type {
    INamespacedEventBus,
    IEventBusAdapter,
    IBaseEvent,
    IEventBusFactory,
} from "@/event-bus/contracts/_module";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus";
import {
    DefaultDriverNotDefinedError,
    UnregisteredDriverError,
} from "@/utilities/global-errors";

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
    rootNamespace?: string;
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
 *     redis: new RedisEventBusAdapter({
 *       dispatcherClient: new Redis(),
 *       listenerClient: new Redis(),
 *     }),
 *   },
 *   defaultDriver: "memory",
 *   rootNamespace: "@events"
 * });
 * ```
 */
export class EventBusFactory<
    TAdapters extends string = string,
    TEvent extends IBaseEvent = IBaseEvent,
> implements IEventBusFactory<TAdapters>
{
    private readonly drivers: EventBusDrivers<TAdapters>;
    private readonly defaultDriver?: TAdapters;
    private readonly rootNamespace?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private validator: Validator<any> = (value) => value;

    constructor(settings: EventBusFactorySettings<TAdapters>) {
        const { drivers, defaultDriver, rootNamespace } = settings;
        this.drivers = drivers;
        this.defaultDriver = defaultDriver;
        this.rootNamespace = rootNamespace;
    }

    use(
        driverName: TAdapters | undefined = this.defaultDriver,
    ): INamespacedEventBus<TEvent> {
        if (driverName === undefined) {
            throw new DefaultDriverNotDefinedError(EventBusFactory.name);
        }
        const selectedAdapter = this.drivers[driverName];
        if (selectedAdapter === undefined) {
            throw new UnregisteredDriverError(driverName);
        }
        return new EventBus(selectedAdapter, {
            rootNamespace: this.rootNamespace,
            validator: this.validator,
        });
    }

    withValidation<TOutput extends IBaseEvent = IBaseEvent>(
        validator: Validator<TOutput>,
    ): IEventBusFactory<TAdapters, TOutput> {
        this.validator = validator;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return this as any;
    }

    withType<TOutput extends IBaseEvent = IBaseEvent>(): IEventBusFactory<
        TAdapters,
        TOutput
    > {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return this as any;
    }
}
