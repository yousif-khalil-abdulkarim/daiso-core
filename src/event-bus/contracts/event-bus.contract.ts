/**
 * @module EventBus
 */

import type { OneOrMore } from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToDispatchEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToAddListenerEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToRemoveListenerEventBusError,
} from "@/event-bus/contracts/event-bus.errors.js";
import type { BaseEvent, Listener } from "@/event-bus/contracts/_shared.js";

/**
 * @group Contracts
 */
export type EventClass<TEvents extends BaseEvent> = {
    new (...arguments_: any[]): TEvents;
};

/**
 * @group Contracts
 */
export type EventInstance<TEventClass extends EventClass<BaseEvent>> =
    TEventClass extends {
        new (...arguments_: any[]): infer TInstance;
    }
        ? TInstance
        : never;
/**
 * @group Contracts
 */
export type Unsubscribe = () => LazyPromise<void>;

/**
 * The <i>IEventListener</i> contract defines a way listening to events independent of underlying technology
 * @group Contracts
 */
export type IEventListener<TEvents extends BaseEvent = BaseEvent> = {
    /**
     * The <i>addListener</i> method is used for adding <i>{@link Listener | listener}</i> for certain <i>event</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    addListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>addListenerMany</i> method is used for adding multiple <i>{@link Listener | listeners}</i> for certain <i>events</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    addListenerMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>removeListener</i> method is used for removing <i>{@link Listener | listener}</i> for certain <i>event</i>.
     * Removing unadded listener will have no effect and nothing will occur.
     * @throws {UnableToRemoveListenerEventBusError} {@link UnableToRemoveListenerEventBusError}
     */
    removeListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>removeListener</i> method is used for removing multiple <i>{@link Listener | listeners}</i> for certain <i>event</i>.
     * Removing unadded listener will have no effect and nothing will occur.
     * @throws {UnableToRemoveListenerEventBusError} {@link UnableToRemoveListenerEventBusError}
     */
    removeListenerMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>listenOnce</i> method is used for adding <i>{@link Listener | listener}</i> for certain <i>event</i> that is trigged only once.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    listenOnce<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>subscribe</i> method is used for adding <i>{@link Listener | listener}</i> for certain <i>event</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     */
    subscribe<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe>;

    /**
     * The <i>subscribeMany</i> method is used for adding <i>{@link Listener | listener}</i> for multiple <i>events</i>.
     * A listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     */
    subscribeMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: Listener<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe>;
};

/**
 * The <i>IEventDispatcher</i> contract defines a way for dispatching to events independent of underlying technology.
 * @group Contracts
 */
export type IEventDispatcher<TEvents extends BaseEvent = BaseEvent> = {
    /**
     * The <i>dispatch</i> method is used for dispatching a <i>event</i>.

     * @throws {UnableToDispatchEventBusError} {@link UnableToDispatchEventBusError}
     */
    dispatch(event: TEvents): LazyPromise<void>;

    /**
     * The <i>dispatchMany</i> method is used for dispatching multiple <i>event</i>.

     * @throws {UnableToDispatchEventBusError} {@link UnableToDispatchEventBusError}
     */
    dispatchMany(events: TEvents[]): LazyPromise<void>;
};

/**
 * The <i>IEventBus</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * It commes with more convient methods compared to <i>IEventBusAdapter</i>.
 * @group Contracts
 */
export type IEventBus<TEvents extends BaseEvent = BaseEvent> =
    IEventListener<TEvents> &
        IEventDispatcher<TEvents> & {
            /**
             * The <i>getGroup</i> method returns the complete group.
             * @example
             * ```ts
             * import { type IEventBus } from "@daiso-tech/core";
             *
             * async function main(eventBus: IEventBus): Promise<void> {
             *   // Will be "@root"
             *   console.log(eventBus.getGroup())
             *
             *   const eventBusA = eventBus.withGroup("a");
             *
             *   // Will be "@root/a"
             *   console.log(eventBusA.getGroup())
             * }
             * ```
             */
            getGroup(): string;
        };

/**
 * The <i>IGroupableEventBus</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * It commes with one extra method which is useful for multitennat applications compared to <i>IEventBus</i>.
 * @group Contracts
 */
export type IGroupableEventBus<TEvents extends BaseEvent = BaseEvent> =
    IEventBus<TEvents> & {
        /**
         * The <i>withGroup</i> method returns new instance of <i>{@link IEventBus}</i> where all the events names will be prefixed with a given <i>group</i>.
         * This useful for multitennat applications.
         * @example
         * ```ts
         * import { type IEventBus } from "@daiso-tech/core";
         *
         * async function main(eventBus: IEventBus): Promise<void> {
         *   const eventBusA = eventBus.withGroup("a");
         *   await eventBusA.subscribe("add", (event) => {
         *     // This will be logged
         *     console.log("eventBusA:", event);
         *   });
         *
         *   const eventBusB = eventBus.withGroup("b");
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
        withGroup(group: OneOrMore<string>): IEventBus<TEvents>;
    };
