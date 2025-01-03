/**
 * @module EventBus
 */

import type {
    INamespacedEventBus,
    IEventBusAdapter,
    IEventBusManager,
    EventBusManagerUseSettings,
    IBaseEvent,
} from "@/event-bus/contracts/_module";
import {
    EventBus,
    type EventBusSettings,
} from "@/event-bus/implementations/event-bus/event-bus";

/**
 * @group Derivables
 */
export type EventBusManagerSettings<TAdapters extends string = string> = {
    adapters: Record<TAdapters, IEventBusAdapter>;
    defaultAdapter: NoInfer<TAdapters>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapterSettings?: Omit<EventBusSettings<any>, "validator">;
};

/**
 * @group Derivables
 */
export class EventBusManager<TAdapters extends string = string>
    implements IEventBusManager<TAdapters>
{
    private readonly adapters: Record<TAdapters, IEventBusAdapter>;
    private readonly defaultAdapter: TAdapters;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly adapterSettings: Omit<EventBusSettings<any>, "validator">;

    constructor(settings: EventBusManagerSettings<TAdapters>) {
        const { adapters, defaultAdapter, adapterSettings = {} } = settings;
        this.adapters = adapters;
        this.defaultAdapter = defaultAdapter;
        this.adapterSettings = adapterSettings;
    }

    use<TEvents extends IBaseEvent = IBaseEvent>(
        adapterSettings: EventBusManagerUseSettings<TEvents, TAdapters>,
    ): INamespacedEventBus<TEvents> {
        const { adapter = this.defaultAdapter, validator } = adapterSettings;
        return new EventBus(this.adapters[adapter], {
            ...this.adapterSettings,
            validator,
        });
    }
}
