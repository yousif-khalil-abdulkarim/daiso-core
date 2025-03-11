/**
 * @module EventBus
 */

import type { BaseEvent } from "@/event-bus/contracts/_shared.js";
import type { Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type EventListenerFn<TEvent> = (event: TEvent) => Promisable<unknown>;

/**
 * The <i>IEventBusAdapter</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * This contract is not meant to be used directly, instead you should use <i>IEventBus</i>
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventBusAdapter = {
    /**
     * The <i>addListener</i> method is used for adding <i>{@link EventListenerFn | listener}</i> for certain <i>eventName</i>.
     */
    addListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): PromiseLike<void>;

    /**
     * The <i>removeListener</i> method is used for removing <i>{@link EventListenerFn | listener}</i> for certain <i>eventName</i>.
     */
    removeListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): PromiseLike<void>;

    /**
     * The <i>dispatch</i> method is used for dispatching one or multiple <i>events</i>.
     */
    dispatch(eventName: string, eventData: BaseEvent): PromiseLike<void>;
};
