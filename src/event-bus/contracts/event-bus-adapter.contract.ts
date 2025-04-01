/**
 * @module EventBus
 */

import type { BaseEvent } from "@/event-bus/contracts/_shared.js";
import type { InvokableFn } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/contracts"`
 * @group Contracts
 */
export type EventListenerFn<TEvent> = InvokableFn<[event: TEvent]>;

/**
 * The `IEventBusAdapter` contract defines a way for dispatching and listening to events independent of underlying technology.
 * This contract is not meant to be used directly, instead you should use `IEventBus`
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/contracts"`
 * @group Contracts
 */
export type IEventBusAdapter = {
    /**
     * The `addListener` method is used for adding `{@link EventListenerFn | listener}` for certain `eventName`.
     */
    addListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): PromiseLike<void>;

    /**
     * The `removeListener` method is used for removing `{@link EventListenerFn | listener}` for certain `eventName`.
     */
    removeListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): PromiseLike<void>;

    /**
     * The `dispatch` method is used for dispatching one or multiple `events`.
     */
    dispatch(eventName: string, eventData: BaseEvent): PromiseLike<void>;
};
