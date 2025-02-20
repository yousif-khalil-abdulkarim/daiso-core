/**
 * @module EventBus
 */

import type { Invokable, OneOrMore } from "@/utilities/_module-exports.js";
import type { LazyPromise } from "@/async/_module-exports.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToDispatchEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToAddListenerEventBusError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnableToRemoveListenerEventBusError,
} from "@/event-bus/contracts/event-bus.errors.js";
import type { BaseEvent } from "@/event-bus/contracts/_shared.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type EventClass<TEvents extends BaseEvent> = {
    new (...arguments_: any[]): TEvents;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type EventInstance<TEventClass extends EventClass<BaseEvent>> =
    TEventClass extends {
        new (...arguments_: any[]): infer TInstance;
    }
        ? TInstance
        : never;
/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type Unsubscribe = () => LazyPromise<void>;

/**
 * The <i>IEventListenable</i> contract defines a way listening to events independent of underlying technology
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventListenable<TEvents extends BaseEvent = BaseEvent> = {
    /**
     * The <i>addListener</i> method is used for listening to a <i>{@link BaseEvent}</i>.
     * The same listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    addListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>addListenerMany</i> method is used for listening to multiple <i>{@link BaseEvent}</i>.
     * The same listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    addListenerMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>removeListener</i> method is used for stop listening to a <i>{@link BaseEvent}</i>.
     * Removing unadded listener will have no effect and nothing will occur.
     * @throws {UnableToRemoveListenerEventBusError} {@link UnableToRemoveListenerEventBusError}
     */
    removeListener<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>removeListener</i> method is used for stop listening to multiple <i>{@link BaseEvent}</i>.
     * Removing unadded listener will have no effect and nothing will occur.
     * @throws {UnableToRemoveListenerEventBusError} {@link UnableToRemoveListenerEventBusError}
     */
    removeListenerMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>listenOnce</i> method is used for listening to a <i>{@link BaseEvent}</i> once.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    listenOnce<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<void>;

    /**
     * The <i>asPromise</i> method returns <i>{@link LazyPromise}</i> objecet that resolves once the <i>{@link BaseEvent}</i> is dispatched.
     * @throws {UnableToAddListenerEventBusError} {@link UnableToAddListenerEventBusError}
     */
    asPromise<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
    ): LazyPromise<EventInstance<TEventClass>>;

    /**
     * The <i>subscribe</i> method is used for listening to a <i>{@link BaseEvent}</i> and it returns a cleanup function that removes listener when called.
     * The same listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     */
    subscribe<TEventClass extends EventClass<TEvents>>(
        event: TEventClass,
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe>;

    /**
     * The <i>subscribeMany</i> method is used for listening to multiple <i>{@link BaseEvent}</i> and it returns a cleanup function that removes listener when called.
     * The same listener can only be added once for a specific event. Adding the same listener multiple times will have no effect and nothing will occur.
     */
    subscribeMany<TEventClass extends EventClass<TEvents>>(
        events: TEventClass[],
        listener: Invokable<EventInstance<TEventClass>>,
    ): LazyPromise<Unsubscribe>;
};

/**
 * The <i>IEventDispatcher</i> contract defines a way for dispatching to events independent of underlying technology.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventDispatcher<TEvents extends BaseEvent = BaseEvent> = {
    /**
     * The <i>dispatch</i> method is used for dispatching a <i>{@link BaseEvent}</i>.

     * @throws {UnableToDispatchEventBusError} {@link UnableToDispatchEventBusError}
     */
    dispatch(event: TEvents): LazyPromise<void>;

    /**
     * The <i>dispatchMany</i> method is used for dispatching multiple <i>{@link BaseEvent}</i>.

     * @throws {UnableToDispatchEventBusError} {@link UnableToDispatchEventBusError}
     */
    dispatchMany(events: TEvents[]): LazyPromise<void>;
};

/**
 * The <i>IEventBus</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * It commes with more convient methods compared to <i>IEventBusAdapter</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IEventBus<TEvents extends BaseEvent = BaseEvent> =
    IEventListenable<TEvents> &
        IEventDispatcher<TEvents> & {
            /**
             * The <i>getGroup</i> method returns the group name.
             */
            getGroup(): string;
        };

/**
 * The <i>IGroupableEventBus</i> contract defines a way for dispatching and listening to events independent of underlying technology.
 * It commes with one extra method which is useful for multitennat applications compared to <i>IEventBus</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type IGroupableEventBus<TEvents extends BaseEvent = BaseEvent> =
    IEventBus<TEvents> & {
        /**
         * The <i>withGroup</i> method returns a new <i>{@link IEventBus}</i> instance that groups events together.
         * Only events in the same group will be listened to. This useful for multitennat applications.
         */
        withGroup(group: OneOrMore<string>): IEventBus<TEvents>;
    };
