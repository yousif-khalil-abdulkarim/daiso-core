/**
 * @module EventBus
 */

import type { OneOrMore } from "@/_shared/types";
import type { IBaseEvent, Listener } from "@/event-bus/contracts/_shared";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DispatchEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AddListenerEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RemoveListenerEventBusError,
} from "@/event-bus/contracts/_shared";

export type SelectEvent<
    TEvents extends IBaseEvent,
    TEventType extends TEvents["type"],
> = Extract<
    TEvents,
    { type: IBaseEvent extends TEvents ? string : TEventType }
>;

export type Unsubscribe = () => PromiseLike<void>;
/**
 * The <i>IListenable</i> contract defines a way listening to events independent of underlying technology
 * @throws {EventBusError} {@link EventBusError}
 * @throws {AddListenerEventBusError} {@link AddListenerEventBusError}
 * @throws {RemoveListenerEventBusError} {@link RemoveListenerEventBusError}
 * @group Contracts
 */
export type IListenable<TEvents extends IBaseEvent = IBaseEvent> = {
    /**
     * The <i>addListener</i> method is used for adding <i>{@link Listener | listener}</i> for certain <i>event</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {EventBusError} {@link EventBusError}
     * @throws {AddListenerEventBusError} {@link AddListenerEventBusError}
     */
    addListener<TEventType extends TEvents["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): PromiseLike<void>;

    /**
     * The <i>addListenerMany</i> method is used for adding multiple <i>{@link Listener | listeners}</i> for certain <i>events</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {EventBusError} {@link EventBusError}
     * @throws {AddListenerEventBusError} {@link AddListenerEventBusError}
     */
    addListenerMany<TEventType extends TEvents["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): PromiseLike<void>;

    /**
     * The <i>removeListener</i> method is used for removing <i>{@link Listener | listener}</i> for certain <i>event</i>.
     * Removing unadded listener will have no effect and nothing will occur.
     * @throws {EventBusError} {@link EventBusError}
     * @throws {RemoveListenerEventBusError} {@link RemoveListenerEventBusError}
     */
    removeListener<TEventType extends TEvents["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): PromiseLike<void>;

    /**
     * The <i>removeListener</i> method is used for removing multiple <i>{@link Listener | listeners}</i> for certain <i>event</i>.
     * Removing unadded listener will have no effect and nothing will occur.
     * @throws {EventBusError} {@link EventBusError}
     * @throws {RemoveListenerEventBusError} {@link RemoveListenerEventBusError}
     */
    removeListenerMany<TEventType extends TEvents["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): PromiseLike<void>;

    /**
     * The <i>subscribe</i> method is used for adding <i>{@link Listener | listener}</i> for certain <i>event</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {EventBusError} {@link EventBusError}
     * @throws {RemoveListenerEventBusError} {@link RemoveListenerEventBusError}
     */
    subscribe<TEventType extends TEvents["type"]>(
        event: TEventType,
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): PromiseLike<Unsubscribe>;

    subscribeMany<TEventType extends TEvents["type"]>(
        events: TEventType[],
        listener: Listener<SelectEvent<TEvents, TEventType>>,
    ): PromiseLike<Unsubscribe>;
};

/**
 * The <i>IEventBus</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * It commes with more convient methods compared to <i>IEventBusAdapter</i>.
 * @throws {EventBusError} {@link EventBusError}
 * @throws {DispatchEventBusError} {@link DispatchEventBusError}
 * @throws {AddListenerEventBusError} {@link AddListenerEventBusError}
 * @throws {RemoveListenerEventBusError} {@link RemoveListenerEventBusError}
 * @group Contracts
 */
export type IEventBus<TEvents extends IBaseEvent = IBaseEvent> =
    IListenable<TEvents> & {
        /**
         * The <i>dispatch</i> method is used for dispatching one or multiple <i>events</i>.
         * @throws {EventBusError} {@link EventBusError}
         * @throws {DispatchEventBusError} {@link DispatchEventBusError}
         */
        dispatch(events: OneOrMore<TEvents>): PromiseLike<void>;
    };

/**
 * The <i>INamespacedEventBus</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * It commes with one extra method which is useful for multitennat applications compared to <i>IEventBus</i>.
 * @throws {EventBusError} {@link EventBusError}
 * @throws {DispatchEventBusError} {@link DispatchEventBusError}
 * @throws {AddListenerEventBusError} {@link AddListenerEventBusError}
 * @throws {RemoveListenerEventBusError} {@link RemoveListenerEventBusError}
 * @group Contracts
 */
export type INamespacedEventBus<TEvents extends IBaseEvent = IBaseEvent> =
    IEventBus<TEvents> & {
        /**
         * The <i>withNamespace</i> method returns new instance of <i>{@link IEventBus}</i> where all the events names will be prefixed with a given <i>namespace</i>.
         * This useful for multitennat applications.
         */
        withNamespace(namespace: string): IEventBus<TEvents>;

        /**
         * The <i>getNamespace</i> method return the complete namespace.
         */
        getNamespace(): string;
    };
