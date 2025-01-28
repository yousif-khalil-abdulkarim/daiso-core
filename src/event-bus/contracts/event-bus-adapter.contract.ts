/**
 * @module EventBus
 */

import type { Listener } from "@/event-bus/contracts/_shared";
import type { BaseEvent } from "@/event-bus/contracts/_shared";

/**
 * The <i>IEventBusAdapter</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * This interface is not meant to be used directly, instead you should use <i>IEventBus</i>
 * @group Contracts
 */
export type IEventBusAdapter = {
    /**
     * The <i>addListener</i> method is used for adding <i>{@link Listener | listener}</i> for certain <i>eventName</i>.
     */
    addListener(
        eventName: string,
        listener: Listener<BaseEvent>,
    ): PromiseLike<void>;

    /**
     * The <i>removeListener</i> method is used for removing <i>{@link Listener | listener}</i> for certain <i>eventName</i>.
     */
    removeListener(
        eventName: string,
        listener: Listener<BaseEvent>,
    ): PromiseLike<void>;

    /**
     * The <i>dispatch</i> method is used for dispatching one or multiple <i>events</i>.
     */
    dispatch(eventName: string, eventData: BaseEvent): PromiseLike<void>;

    getGroup(): string;

    withGroup(group: string): IEventBusAdapter;
};
