/**
 * @module EventBus
 */

import type { OneOrMore, Values } from "@/utilities/_module";
import type { LazyPromise } from "@/async/_module";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DispatchEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AddListenerEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RemoveListenerEventBusError,
} from "@/event-bus/contracts/event-bus.errors";
import type { Listener } from "@/event-bus/contracts/_shared";

export type BaseEvents = Record<string, Record<string, unknown>>;

export type AllEvents<TEvents extends BaseEvents> = Values<{
    [TEventName in keyof TEvents]: TEvents[TEventName] & {
        type: TEventName;
    };
}>;

export type SelectEvent<
    TEvents extends BaseEvents,
    TEventName extends keyof TEvents,
> = {
    [TEventName in keyof TEvents]: TEvents[TEventName] & {
        type: TEventName;
    };
}[TEventName];

export type Unsubscribe = () => LazyPromise<void>;

/**
 * The <i>IListenable</i> contract defines a way listening to events independent of underlying technology
 * @group Contracts
 */
export type IListenable<TEvents extends BaseEvents = BaseEvents> = {
    /**
     * The <i>addListener</i> method is used for adding <i>{@link Listener | listener}</i> for certain <i>event</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {AddListenerEventBusError} {@link AddListenerEventBusError}
     */
    addListener<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void>;

    /**
     * The <i>addListenerMany</i> method is used for adding multiple <i>{@link Listener | listeners}</i> for certain <i>events</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {AddListenerEventBusError} {@link AddListenerEventBusError}
     */
    addListenerMany<TEventName extends keyof TEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void>;

    /**
     * The <i>removeListener</i> method is used for removing <i>{@link Listener | listener}</i> for certain <i>event</i>.
     * Removing unadded listener will have no effect and nothing will occur.
     * @throws {RemoveListenerEventBusError} {@link RemoveListenerEventBusError}
     */
    removeListener<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void>;

    /**
     * The <i>removeListener</i> method is used for removing multiple <i>{@link Listener | listeners}</i> for certain <i>event</i>.
     * Removing unadded listener will have no effect and nothing will occur.
     * @throws {RemoveListenerEventBusError} {@link RemoveListenerEventBusError}
     */
    removeListenerMany<TEventName extends keyof TEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<void>;

    /**
     * The <i>subscribe</i> method is used for adding <i>{@link Listener | listener}</i> for certain <i>event</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     */
    subscribe<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<Unsubscribe>;

    /**
     * The <i>subscribeMany</i> method is used for adding <i>{@link Listener | listener}</i> for multiple <i>events</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     */
    subscribeMany<TEventName extends keyof TEvents>(
        eventNames: TEventName[],
        listener: Listener<SelectEvent<TEvents, TEventName>>,
    ): LazyPromise<Unsubscribe>;
};

/**
 * The <i>IDispatcher</i> contract defines a way for dispatching to events independent of underlying technology.
 * @group Contracts
 */
export type IDispatcher<TEvents extends BaseEvents = BaseEvents> = {
    /**
     * The <i>dispatch</i> method is used for dispatching one or multiple <i>events</i>.

     * @throws {DispatchEventBusError} {@link DispatchEventBusError}
     */
    dispatch(events: OneOrMore<AllEvents<TEvents>>): LazyPromise<void>;
};

/**
 * The <i>IEventBus</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * It commes with more convient methods compared to <i>IEventBusAdapter</i>.
 * @group Contracts
 */
export type IEventBus<TEvents extends BaseEvents = BaseEvents> =
    IListenable<TEvents> &
        IDispatcher<TEvents> & {
            /**
             * The <i>getNamespace</i> method returns the complete namespace.
             * @example
             * ```ts
             * import { type IEventBus } from "@daiso-tech/core";
             *
             * async function main(eventBus: IEventBus): Promise<void> {
             *   // Will be "@root"
             *   console.log(eventBus.getNamespace())
             *
             *   const eventBusA = eventBus.withNamespace("a");
             *
             *   // Will be "@root/a"
             *   console.log(eventBusA.getNamespace())
             * }
             * ```
             */
            getNamespace(): string;
        };

/**
 * The <i>INamespacedEventBus</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * It commes with one extra method which is useful for multitennat applications compared to <i>IEventBus</i>.
 * @group Contracts
 */
export type INamespacedEventBus<TEvents extends BaseEvents = BaseEvents> =
    IEventBus<TEvents> & {
        /**
         * The <i>withNamespace</i> method returns new instance of <i>{@link IEventBus}</i> where all the events names will be prefixed with a given <i>namespace</i>.
         * This useful for multitennat applications.
         * @example
         * ```ts
         * import { type IEventBus } from "@daiso-tech/core";
         *
         * async function main(eventBus: IEventBus): Promise<void> {
         *   const eventBusA = eventBus.withNamespace("a");
         *   await eventBusA.subscribe("add", (event) => {
         *     // This will be logged
         *     console.log("eventBusA:", event);
         *   });
         *
         *   const eventBusB = eventBus.withNamespace("b");
         *   await eventBusB.subscribe("add", (event) => {
         *     // This will never be logged
         *     console.log("eventBusB:", event);
         *   });
         *
         *   await eventBusA.dispatch({
         *     type: "add",
         *     a: 1,
         *     b: 2
         *   })
         * }
         * ```
         */
        withNamespace(namespace: OneOrMore<string>): IEventBus<TEvents>;
    };
