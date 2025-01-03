/**
 * @module EventBus
 */

import type { Validator } from "@/utilities/_module";
import type { INamespacedEventBus } from "@/event-bus/contracts/event-bus.contract";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IEventBusAdapter } from "@/event-bus/contracts/event-bus-adapter.contract";
import type { IBaseEvent } from "@/event-bus/contracts/_shared";

/**
 * @group Contracts
 */
export type EventBusManagerUseSettings<
    TType,
    TAdapters extends string = string,
> = {
    adapter?: TAdapters;
    validator?: Validator<TType>;
};

/**
 * The <i>IEventBusManager</i> contract makes it easy to switch between different <i>{@link IEventBusAdapter | event bus adapters}</i> dynamically.
 * @group Contracts
 */
export type IEventBusManager<TAdapters extends string = string> = {
    use<TEvents extends IBaseEvent = IBaseEvent>(
        settings?: EventBusManagerUseSettings<TEvents, TAdapters>,
    ): INamespacedEventBus<TEvents>;
};
